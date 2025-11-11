import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// API handler for menu extraction
export async function POST(req: NextRequest) {
  try {
    // Read and validate input image (base64 Data URL from frontend)
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // API key in environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare image data for Gemini (remove Data URL prefix, keep pure base64)
    const base64Image = image.split(",")[1];

    // Compose prompt for menu extraction
    const prompt = `
Extract all food items from this menu image. 
Return only a JSON object with the key "menuItems" which is an array of objects with {name, price}.
For each item:
- name: the food item name (string)
- price: convert all prices to INR (Indian Rupees) format as a number without currency symbol
If price is not visible or unclear, use 0.
Do not include anything except valid parsable JSON.
Example format: {"menuItems": [{"name": "Burger", "price": 150}, {"name": "Pizza", "price": 250}]}
`;

    // Build contents array as in docs
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "No textual response from Gemini" },
        { status: 500 }
      );
    }

    // Extract valid JSON object from model output (if markdown fencing, strip)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Gemini response did not include valid JSON." },
        { status: 500 }
      );
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Return extracted menu data
    return NextResponse.json(extractedData);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Failed to extract menu items",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
