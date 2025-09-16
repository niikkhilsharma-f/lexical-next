import { NextResponse } from "next/server";
import fs from "fs";
import path, { resolve } from "path";
import { JSDOM } from "jsdom";

const wkhtmltopdf = require("wkhtmltopdf");

wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";

import { spawn } from "child_process";

export async function POST(request) {
  try {
    const data = await request.json();

    const filePath = path.resolve(process.cwd(), "data", "savedData.html");
    const pdfPath = path.resolve(process.cwd(), "data", "send.pdf");

    console.log("File path:", filePath);
    console.log("PDF path:", pdfPath);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    let finalContent;

    if (fs.existsSync(filePath)) {
      const existingContent = fs.readFileSync(filePath, "utf-8");

      try {
        const dom = new JSDOM(existingContent);
        const document = dom.window.document;
        const body = document.querySelector("body");

        if (body) {
          body.innerHTML = data.content;
          finalContent = dom.serialize();
        } else {
          throw new Error("No body tag found");
        }
      } catch (parseError) {
        finalContent = existingContent.replace(
          /<body[^>]*>[\s\S]*<\/body>/i,
          `<body>${data.content}</body>`
        );
      }
    } else {
      const dom = new JSDOM(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saved Content</title>
</head>
<body>
    ${data.content}
</body>
</html>`);
      finalContent = dom.serialize();
    }

    fs.writeFileSync(filePath, finalContent);

    return new Promise((resolve, reject) => {
      const wkhtmltopdfPath =
        "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";
      const wkhtmlProcess = spawn(wkhtmltopdfPath, [
        "--page-size",
        "A3",
        "--orientation",
        "Portrait",
        filePath,
        pdfPath,
      ]);

      wkhtmlProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      wkhtmlProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });

      wkhtmlProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`wkhtmltopdf process exited with code ${code}`);
          reject(
            NextResponse.json(
              { message: `wkhtmltopdf process exited with code ${code}` },
              { status: 500 }
            )
          );
        } else {
          console.log("PDF generated successfully");
          resolve(
            NextResponse.json({
              message: "Data saved and PDF generated successfully",
              data,
              pdfPath: pdfPath,
            })
          );
        }
      });

      wkhtmlProcess.on("error", (err) => {
        console.error("PDF generation error:", err);
        reject(
          NextResponse.json(
            { message: "Error generating PDF", error: err.message },
            { status: 500 }
          )
        );
      });
    });
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
