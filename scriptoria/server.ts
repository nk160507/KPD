import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Ollama } from 'ollama';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// AI Setup
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });

// API Routes
app.post('/api/generate', async (req, res) => {
  const { storyIdea } = req.body;
  if (!storyIdea) {
    return res.status(400).json({ error: 'Story idea is required' });
  }

  try {
    const prompt = `Based on the following story idea, generate three distinct outputs:
1. A short screenplay scene (approx 1-2 pages).
2. Character profiles for the main characters.
3. Sound design notes for the scene.

Story Idea:
"${storyIdea}"

Return the response in JSON format with the following keys:
- screenplay
- characters
- soundDesign`;

    const response = await ollama.generate({
      model: 'granite4',
      prompt: prompt,
      format: 'json',
      stream: false,
    });

    let text = response.response;
    if (!text) {
      throw new Error('No response from AI');
    }

    // Clean up potential markdown formatting
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let generatedData;
    try {
      generatedData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error. Raw text:', text);
      throw new Error('AI returned invalid JSON format');
    }

    res.json({ success: true, data: generatedData });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate content', details: error.message });
  }
});

app.post('/api/download/:format', async (req, res) => {
  const { format } = req.params;
  const { type } = req.query; // 'screenplay', 'characters', 'soundDesign', or 'all'
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }

  let textToExport = '';
  if (type === 'screenplay') textToExport = content.screenplay;
  else if (type === 'characters') textToExport = content.characters;
  else if (type === 'soundDesign') textToExport = content.soundDesign;
  else {
    textToExport = `--- SCREENPLAY ---\n${content.screenplay}\n\n--- CHARACTERS ---\n${content.characters}\n\n--- SOUND DESIGN ---\n${content.soundDesign}`;
  }

  const filename = `export_${type || 'all'}`;

  if (format === 'txt') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
    res.send(textToExport);
  } else if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    
    const PDFDoc = (PDFDocument as any).default || PDFDocument;
    const doc = new PDFDoc({ margin: 50 });
    doc.pipe(res);
    
    doc.font('Times-Roman').fontSize(11).text(textToExport, {
      align: 'justify',
      lineGap: 2
    });
    
    doc.end();
  } else if (format === 'docx') {
    const paragraphs = textToExport.split('\n').map(line => {
      return new Paragraph({
        children: [new TextRun(line)],
        alignment: line.startsWith('---') ? AlignmentType.CENTER : AlignmentType.LEFT,
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const b64string = await Packer.toBase64String(doc);
    const buffer = Buffer.from(b64string, 'base64');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.docx"`);
    res.send(buffer);
  } else {
    res.status(400).json({ error: 'Invalid format' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
