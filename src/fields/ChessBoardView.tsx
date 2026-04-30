
export const ChessBoardView = (value: any) => {
    let toShow = undefined;
    if (value.value) {
      toShow = value.value;
    } else {
      toShow = value.inputVal;
    }

    const divContent = value.isPGN ? 
      `<div class="cbreplay">${toShow}</div>` : 
      `<div class="cbdiagram" data-buttons="0" data-size="600" data-fen="${toShow}"></div>`;

    return (
      <iframe
        style={{ border: 0 }}
        width={"100%"}
        height={value.height}
        srcDoc={`
          <html>
          <head>
          <link rel="stylesheet" type="text/css" href="https://pgn.chessbase.com/CBReplay.css"/>
          <script src="https://pgn.chessbase.com/jquery-3.0.0.min.js"></script>
          <script src="https://pgn.chessbase.com/cbreplay.js" type="text/javascript"></script>    
          </head>
          <body>
          ${divContent}
          </body>
          </html>
        `}
      />
    );
};

