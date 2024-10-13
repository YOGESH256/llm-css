import { ChatOpenAI } from "@langchain/openai";  
import { PromptTemplate } from "@langchain/core/prompts";
import config from '../config/index.js';
import * as cheerio from 'cheerio';

// Initialize the chat model
const model = new ChatOpenAI({ 
  openAIApiKey: config.OPENAI_API_KEY, 
  modelName: "gpt-4o",
  temperature: 0.7,
  maxTokens: 100,
  maxRetries: 2,
});

const template = `Analyze the provided HTML content of a review page. Identify CSS selectors for the following elements:

1. Review container (element containing a single review)
2. Review title
3. Review body
4. Rating
5. Reviewer name
6. Next page button or link (for pagination)

Make sure to return the CSS selectors in **plain JSON** format with **double quotes** around property names and values, without any extra formatting like code blocks or backticks. Here is the structure:

{{
  "selectors": {{
    "reviewContainer": "CSS_SELECTOR",
    "reviewTitle": "CSS_SELECTOR",
    "reviewBody": "CSS_SELECTOR",
    "rating": "CSS_SELECTOR",
    "reviewerName": "CSS_SELECTOR",
    "nextPageButton": "CSS_SELECTOR"
}}
}}

Ensure that your response is a valid JSON object:
- Use double quotes for all property names and string values
- Do not include any comments or trailing commas


if you don't have the data pass empty object with structure intact in json object without any backticks.

HTML content to analyze:
{html_content}
`;




// Create the prompt template
const prompt = PromptTemplate.fromTemplate(template);

// Function to chunk the HTML content
function chunkHtmlContentFromEnd(htmlContent, chunkSize) {
  const chunks = [];
  for (let i = htmlContent.length; i > 0; i -= chunkSize) {
    chunks.push(htmlContent.slice(Math.max(0, i - chunkSize), i));
  }
  return chunks.reverse(); 
}



async function preprocessHTML(html) {
  const $ = cheerio.load(html);
  
  
  $('script, style, comment').remove();
  
  const mainContent = $('main, #main, .main').first();
  return mainContent.length ? mainContent.html() : $.html();
}

async function identifyCssSelectors(htmlContent) {
  try {
 
    const preProcesshtml = await preprocessHTML(htmlContent)
    const chunks = chunkHtmlContentFromEnd(preProcesshtml, 8000); 

    const results = [];
    
    for (const [index, chunk] of chunks.entries()) {
      
      if(index > 45) break;
      const chain = prompt.pipe(model);
      
      
      const result = await chain.invoke({ html_content: chunk });
      
      
      console.log(result, `Model response for chunk ${index + 1}`);
      
      
      const parsedResult = JSON.parse(result.content)

      console.log(parsedResult)
      results.push((parsedResult.selectors)); 
    }
    
    return results; 
  } catch (error) {
    console.error("Error identifying CSS selectors:", error);
    throw error;
  }
}

export { identifyCssSelectors };