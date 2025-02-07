# Pasta de Músicas do Rádio

Esta pasta contém as músicas que serão tocadas no rádio do jogo.

## Estrutura

- `tracks.json`: Arquivo que lista todas as músicas disponíveis
- `*.mp3`: Arquivos de música no formato MP3

## Como Adicionar Músicas

1. Adicione o arquivo MP3 nesta pasta
2. Atualize o arquivo `tracks.json` adicionando uma nova entrada com:
   ```json
   {
     "title": "Título da Música",
     "artist": "Nome do Artista",
     "filename": "nome-do-arquivo.mp3",
     "duration": 180, // Duração em segundos
     "addedAt": "2024-02-07T00:00:00.000Z", // Data de adição
     "addedBy": "Seu Nome" // Quem adicionou
   }
   ```

## Recomendações

- Use arquivos MP3 de boa qualidade mas com tamanho otimizado
- Mantenha os nomes dos arquivos em minúsculas e sem espaços
- Certifique-se que a duração informada está correta
- Mantenha o volume das músicas normalizado 