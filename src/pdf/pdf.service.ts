import { Injectable } from "@nestjs/common";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, readFile, unlink } from "fs/promises";

const execFileAsync = promisify(execFile);

@Injectable()
export class PdfService {
  /**
   * Converte a primeira página do PDF em PNG (Buffer em memória)
   */
  async pdfFirstPageToImageBuffer(pdfBuffer: Buffer, filename = "temp"): Promise<Buffer> {
    // Caminhos temporários
    const tempPdfPath = join(tmpdir(), `${Date.now()}-${filename}.pdf`);
    const tempPngPath = join(tmpdir(), `${Date.now()}-${filename}`);

    try {
      // Escreve o PDF temporário
      await writeFile(tempPdfPath, pdfBuffer);

      // Executa o pdftoppm para gerar PNG da página 1
      await execFileAsync("pdftoppm", [
        "-png",
        "-f", "1",
        "-l", "1", // só a primeira página
        "-singlefile",
        tempPdfPath,
        tempPngPath
      ]);

      // Lê o PNG gerado
      const buffer = await readFile(`${tempPngPath}.png`);
      return buffer;
    } finally {
      // Limpa arquivos temporários
      try { await unlink(tempPdfPath); } catch {}
      try { await unlink(`${tempPngPath}.png`); } catch {}
    }
  }
}