import * as cheerio from "cheerio";

export async function extractCleanTextFromUrl(url) {
  try {
    const res = await fetch(url).catch((err) => {
      console.log(`Fetch error for ${url}: `, err);
    });
    if (!res) {
      return "";
    }
    const html = await res.text();

    const $ = cheerio.load(html);

    $("script, style, noscript, meta, iframe").remove();

    $("nav, footer").remove();

    const text = $("body")
      .find("*")
      .map((_, el) => $(el).text())
      .get()
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return text;
  } catch (err) {
    console.error(`Failed to extract text from ${url}:`, err?.message);
    return "";
  }
}
