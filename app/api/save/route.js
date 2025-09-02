import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data, "the data from the client");

    const filePath = path.join(process.cwd(), "data", "savedData.html");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    console.log(data.content);
    fs.writeFileSync(filePath, data.content);

    return NextResponse.json({ message: "Data received", data });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "savedData.html");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = fileContents;
      console.log(data);
      // return NextResponse.json(data);
      return new Response(fileContents, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error reading data:", error);
    return NextResponse.json(
      { message: "Error reading data" },
      { status: 500 }
    );
  }
}
