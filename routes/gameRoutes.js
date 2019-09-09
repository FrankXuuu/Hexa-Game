const mongoose = require('mongoose');
require('../models/board');
require('../models/hexagon');
const Board = mongoose.model('board');
const Hexagon = mongoose.model('hexagon');

/* curl -XPOST -H "Content-type: application/json" -d '{"name": "ay", "size": 4, "nullSpaces": []}' 'http://localhost:5000/api/board/create' 
   curl 'http://localhost:5000/api/board/all'
   curl 'http://localhost:5000/api/5ab9b6e379f26f82f4700228/hexagons/'
   curl -XPATCH -H "Content-type: application/json" -d '{"q": 3, "r": -1, "s": -2}' 'http://localhost:5000/api/hexagon/5ab9b6e379f26f82f4700263/clone'
*/

var InitBoard = (function(board) {
  return function board(board) {
    this.name = board.name;
    this.size = board.size;
    this.rubyGoogleId = board.rubyGoogleId;
    this.pearlGoogleId = board.pearlGoogleId;
    this.nullSpaces = board.nullSpaces;
    this.redTotal = 3;
    this.blueTotal = 3;
    this.currPlayer = 'ruby';
  };
})();

function initHexagons(board, size) {
  for (let q = -size; q <= size; q++) {
    let r1 = Math.max(-size, -q - size);
    let r2 = Math.min(size, -q + size);
    for (let r = r1; r <= r2; r++) {
      saveHexagon(board, size, q, r, -q - r);
    }
  }
}

function saveHexagon(board, size, q, r, s) {
  isRed =
    (q == size && r == -size && s == 0) ||
    (q == -size && r == 0 && s == size) ||
    (q == 0 && r == size && s == -size);
  isBlue =
    (q == -size && r == size && s == 0) ||
    (q == 0 && r == -size && s == size) ||
    (q == size && r == 0 && s == -size);
  console.log(isRed, isBlue, q, r, s);
  let className = 'empty';
  if (isRed) className = 'ruby';
  else if (isBlue) className = 'pearl';
  let hexagon = new Hexagon({
    props: { className: className },
    q: q,
    r: r,
    s: s,
    board: board
  });
  hexagon.save();
}

function distance(indicesA, indicesB) {
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += Math.abs(indicesA[i] - indicesB[i]);
  }
  return sum / 2;
}

function generateJumpIndices(row, col) {
  return [
    [row - 4, col].toString(),
    [row + 4, col].toString(),
    [row + 3, col - 1].toString(),
    [row + 3, col + 1].toString(),
    [row + 2, col - 2].toString(),
    [row + 2, col + 2].toString(),
    [row, col - 2].toString(),
    [row, col + 2].toString(),
    [row - 2, col - 2].toString(),
    [row - 2, col + 2].toString(),
    [row - 3, col - 1].toString(),
    [row - 3, col + 1].toString()
  ];
}
function noMoves(Hexagons, state){
	let noMoves = true;
	for(let i = 0; i < Hexagons.length; i++){
		if(Hexagons[i].props.className == state){
			if(noOptions(Hexagons[i]) == false){
				noMoves = false;
			}
		}
	}
	return noMoves;
}
function noOptions(Hex){
	let noOption = false;
	let cloneOption = true;
	let jumpOption = true;
	const empty = { className: 'empty' };
	let q = Hex.q;
	let r = Hex.r;
	let s = Hex.s;
	Hexagon.find(
		{
		props: empty,
		$or: [
			{ q: q, r: r - 1, s: s + 1 },
			{ q: q + 1, r: r - 1, s: s },
			{ q: q + 1, r: r, s: s - 1 },
			{ q: q, r: r + 1, s: s - 1 },
			{ q: q - 1, r: r + 1, s: s },
			{ q: q - 1, r: r, s: s + 1 }
		]
		}, function(err, hexs){
			if(hexs.length == 0){
				cloneOption = false;
			}
		}
	)
	Hexagon.find(
		{
		props: empty,
		$or: [
			{ q: q, r: r - 2, s: s + 2 },
			{ q: q + 1, r: r - 2, s: s + 1 },
			{ q: q + 2, r: r - 2, s: s },
			{ q: q - 1, r: r - 1, s: s + 2 },
			{ q: q + 2, r: r - 1, s: s - 1 },
			{ q: q - 2, r: r, s: s + 2 },
			{ q: q + 2, r: r, s: s - 2 },
			{ q: q - 2, r: r + 1, s: s + 1 },
			{ q: q + 1, r: r + 1, s: s - 2 },
			{ q: q - 2, r: r + 2, s: s },
			{ q: q - 1, r: r + 2, s: s - 1 },
			{ q: q, r: r + 2, s: s - 2 }
		]
		}, function(err, hexs){
			if(hexs.length == 0){
				jumpOption = false;
			}
		}
	)
	if(cloneOption == false && jumpOption == false){
		noOption = true;
	}
	return noOption;
}

module.exports = app => {
  app.post('/api/board/create/', function(req, res, next) {
    console.log(req.body);
    let board = new Board(new InitBoard(req.body));
    board.save(function(err, board) {
      console.log(board)
      if (err) return res.status(500).end(err);
      initHexagons(board._id, board.size);
      res.json(board);
    });
  });

  app.post('/api/board/options/', function(req, res, next){
	let moves = noMoves(req.body.hexagons, req.body.state);
	res.json(moves);
  });

  app.get('/api/board/all/', function(req, res, next) {
    Board.find(function(err, boards) {
      if (err) return res.status(500).end(err);
      res.json(boards);
    });
  });

  app.get('/api/:boardId/hexagons/', function(req, res, next) {
    Hexagon.find({ board: req.params.boardId }, function(err, hexagons) {
      if (err) return res.status(500).end(err);
      res.json(hexagons);
    });
  });

  app.get('/api/user/:id/board/', function(req, res, next){
    Board.findOne({gameDone: false, $or: [{rubyGoogleId: req.params.id}, {pearlGoogleId: req.params.id}]}, function (err, board){
      if (err) return res.status(500).end("Internal Server error");
      if (!board) return res.status(404).end("Board not found, no current game in session");
      res.json(board);
    });
  });

  app.patch('/api/board/:id/gamedone/', function(req, res, next){
    Board.update({_id: req.params.id},
      { $set: { gameDone: true } }, function (err, board){
      if (err) return res.status(500).end("Internal Server error");
      if (!board) return res.status(404).end("Board not found, no current game in session");
      res.json(board);
    });
  });

  app.post('/api/user/new', function(req, res, next) {
    const newUser = req.body;
    User.save(newUser, function(err, user) {
      if (err) return res.status(500).end('Internal Server error');
      res.json(user);
    });
  });

  app.patch('/api/hexagon/:id/clone', function(req, res, next) {
    console.log(req.body);
    Hexagon.findOne({ _id: req.params.id }, function(err, hexagon) {
      if (err) return res.status(500).end('Internal Server error');
      if (!hexagon) return res.status(400).end('hexagon does not exist');
      let indicesA = [hexagon.q, hexagon.r, hexagon.s];
      let q = req.body.q;
      let r = req.body.r;
      let s = req.body.s;
      const currProps = hexagon.props;
      const boardId = hexagon.board;
      const oppProps =
        currProps.className == 'pearl'
          ? { className: 'ruby' }
          : { className: 'pearl' };
      Board.findOne({ _id: boardId }, function(err, board) {
        if (err) return res.status(500).end('Internal Server error');
        if (!board) return res.status(401).end('board does not exist');
        if (currProps.className == 'empty' || currProps.className == 'null')
          res.status(410).end('trying to move an empty/null hexagon');
        if (board.currPlayer != currProps.className)
          res.status(402).end('not your turn');
        if (
          distance(indicesA, [q, r, s]) != 1 ||
          !(currProps.className == 'ruby' || currProps.className == 'pearl')
        )
          return res.status(403).end('invalid move');
        Hexagon.findOne({ q: q, r: r, s: s, board: boardId }, function(
          err,
          clone
        ) {
          if (err) return res.status(500).end('Internal Server error');
          if (!clone)
            return res.status(404).end('clone position does not exist');
          console.log(hexagon, clone, board);
          if (clone.props.className != 'empty')
            return res.status(405).end('jump pos is not empty');
          clone.props = currProps;
          clone.save(function(err, __) {
            if (err) return res.status(500).end('Internal Server errorr');
            Hexagon.updateMany(
              {
                board: boardId,
                props: oppProps,
                $or: [
                  { q: q, r: r - 1, s: s + 1 },
                  { q: q + 1, r: r - 1, s: s },
                  { q: q + 1, r: r, s: s - 1 },
                  { q: q, r: r + 1, s: s - 1 },
                  { q: q - 1, r: r + 1, s: s },
                  { q: q - 1, r: r, s: s + 1 }
                ]
              },
              { $set: { props: currProps } },
              function(err, adjacents) {
                if (err) return res.status(500).end('Internal Server error3');
                console.log(adjacents);
                if (board.currPlayer == 'ruby') {
                  board.redTotal = board.redTotal + adjacents.nModified + 1;
                  board.blueTotal = board.blueTotal - adjacents.nModified;
                } else {
                  board.blueTotal = board.blueTotal + adjacents.nModified + 1;
                  board.redTotal = board.redTotal - adjacents.nModified;
                }
                console.log(board);
                board.currPlayer = oppProps.className;
                console.log('right before disaster', board);
                board.save(function(err, _) {
                  if (err) return res.status(500).end('Internal Server error');
                  Hexagon.find(
                    {
                      board: boardId,
                      $or: [
                        { q: q, r: r, s: s },
                        { q: q, r: r - 1, s: s + 1 },
                        { q: q + 1, r: r - 1, s: s },
                        { q: q + 1, r: r, s: s - 1 },
                        { q: q, r: r + 1, s: s - 1 },
                        { q: q - 1, r: r + 1, s: s },
                        { q: q - 1, r: r, s: s + 1 }
                      ]
                    },
                    function(err, updated) {
                      if (err)
                        return res.status(500).end('Internal Server error4');
                      res.json(updated);
                    }
                  );
                });
              }
            );
          });
        });
      });
    });
  });

  app.patch('/api/hexagon/:id/jump', function(req, res, next) {
    Hexagon.findOne({ _id: req.params.id }, function(err, hexagon) {
      if (err) return res.status(500).end('Internal Server error');
      if (!hexagon) return res.status(400).end('hexagon does not exist');
      let indicesA = [hexagon.q, hexagon.r, hexagon.s];
      let q = req.body.q;
      let r = req.body.r;
      let s = req.body.s;
      const currProps = hexagon.props;
      const boardId = hexagon.board;
      const oppProps =
        currProps.className == 'pearl'
          ? { className: 'ruby' }
          : { className: 'pearl' };
      Board.findOne({ _id: boardId }, function(err, board) {
        if (err) return res.status(500).end('Internal Server error');
        if (!board) return res.status(401).end('board does not exist');
        if (currProps.className == 'empty' || currProps.className == 'null')
          res.status(410).end('trying to move an empty/null hexagon');
        console.log(board.currPlayer, currProps.className);
        if (board.currPlayer != currProps.className)
          res.status(402).end('not your turn');
        if (
          distance(indicesA, [q, r, s]) != 2 ||
          !(currProps.className == 'ruby' || currProps.className == 'pearl')
        )
          return res.status(403).end('invalid move');
        Hexagon.findOne({ q: q, r: r, s: s, board: boardId }, function(
          err,
          clone
        ) {
          if (err) return res.status(500).end('Internal Server error');
          if (!clone)
            return res.status(404).end('clone position does not exist');
          if (clone.props.className != 'empty')
            return res.status(405).end('jump position is not empty');
          hexagon.props = { className: 'empty' };
          hexagon.save(function(err, __) {
            if (err) return res.status(500).end('Internal Server error');
            clone.props = currProps;
            clone.save(function(err, ___) {
              if (err) return res.status(500).end('Internal Server errorr');
              Hexagon.updateMany(
                {
                  board: boardId,
                  props: oppProps,
                  $or: [
                    { q: q, r: r - 1, s: s + 1 },
                    { q: q + 1, r: r - 1, s: s },
                    { q: q + 1, r: r, s: s - 1 },
                    { q: q, r: r + 1, s: s - 1 },
                    { q: q - 1, r: r + 1, s: s },
                    { q: q - 1, r: r, s: s + 1 }
                  ]
                },
                { $set: { props: currProps } },
                function(err, adjacents) {
                  if (err) return res.status(500).end('Internal Server error3');
                  console.log(board, adjacents);
                  if (board.currPlayer == 'ruby') {
                    board.redTotal = board.redTotal + adjacents.nModified;
                    board.blueTotal = board.blueTotal - adjacents.nModified;
                  } else {
                    board.blueTotal = board.blueTotal + adjacents.nModified;
                    board.redTotal = board.redTotal - adjacents.nModified;
                  }
                  console.log('----------------', board);
                  board.currPlayer = oppProps.className;
                  console.log('right before disaster', board);
                  board.save(function(err, _) {
                    if (err)
                      return res.status(500).end('Internal Server error');
                    Hexagon.find(
                      {
                        board: boardId,
                        $or: [
                          { q: q, r: r, s: s },
                          { q: q, r: r - 1, s: s + 1 },
                          { q: q + 1, r: r - 1, s: s },
                          { q: q + 1, r: r, s: s - 1 },
                          { q: q, r: r + 1, s: s - 1 },
                          { q: q - 1, r: r + 1, s: s },
                          { q: q - 1, r: r, s: s + 1 }
                        ]
                      },
                      function(err, updated) {
                        if (err)
                          return res.status(500).end('Internal Server error4');
                        res.json(updated);
                      }
                    );
                  });
                }
              );
            });
          });
        });
      });
    });
  });

  app.get('/api/board/:id', function(req, res, next) {
    Board.findOne({ _id: req.params.id }, function(err, board) {
      if (err) return res.status(500).end('Internal Server error');
      res.json(board);
    });
  });

  app.get('/ayy', function(req, res, next) {
    Hexagon.findOne(
      { board: '5ab9b6e379f26f82f4700228', q: 4, r: 0, s: -4 },
      function(err, hex) {
        res.json(hex);
      }
    );
  });

  app.get('/yee/', function(req, res, next) {
    Hexagon.remove({}, function(err, meme) {
      res.json(meme);
    });
  });
};
