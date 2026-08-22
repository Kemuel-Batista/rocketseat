import re
import os

def remover_timestamps(texto):
  padrao = r'\b\d{1,2}:\d{1,2}(?:\.\d+)?\b'
  texto_sem_timestamps = re.sub(padrao, '', texto)

  # Remove linhas em branco (ou só com espaços)
  linhas = texto_sem_timestamps.splitlines()
  linhas = [linha.strip() for linha in linhas if linha.strip() != ""]

  return "\n".join(linhas)

def main():
  filename = "remove-timestamps.txt"
    
  # Caminho completo no diretório atual
  caminho = os.path.join(os.getcwd(), filename)

  if not os.path.exists(caminho):
    print(f"Arquivo '{filename}' não encontrado no path atual!")
    return

  # Lê o arquivo
  with open(caminho, "r", encoding="utf-8") as f:
    conteudo = f.read()

  # Remove timestamps
  texto_limpo = remover_timestamps(conteudo)

  # Salva resultado em novo arquivo
  output_file = "remove-timestamps-output.txt"
  with open(output_file, "w", encoding="utf-8") as f:
    f.write(texto_limpo)

  print(f"Timestamps removidos com sucesso! novo arquivo: {output_file}")

if __name__ == "__main__":
  main()
