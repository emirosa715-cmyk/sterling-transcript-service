const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer-core");

const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (logo file must be inside /public)
app.use(express.static(path.join(__dirname, "public")));

// Transcript route
app.get("/transcript", async (req, res) => {
  try {
    // Launch Puppeteer using Render's built-in Chrome
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // Render EJS template
    const html = await new Promise((resolve, reject) => {
      app.render("transcript", {
        studentName: "Sample Student",
        years: "2022–2026",
        registrar: "E. Rosa"
      }, (err, rendered) => {
        if (err) reject(err);
        else resolve(rendered);
      });
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=transcript.pdf"
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).send("Error generating transcript PDF.");
  }
});

// Required for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
