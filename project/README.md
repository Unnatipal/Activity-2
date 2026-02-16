# Pastel 5×5 Sudoku

Simple web app: playful 9×9 Sudoku (classic rules: each row, column, and 3×3 box contains numbers 1–9). Designed with a pastel palette and a draggable floating window inspired by uploaded images.

How to run

Open `index.html` in your browser (no server required).

Files

- `index.html` — UI and structure
- `style.css` — pastel styles and floating window
- `app.js` — 9×9 Sudoku generator, interactions, draggable behavior
- `download.jpg` — referenced thumbnail (use your uploaded image)

Notes

- The app now uses a backtracking generator to create a full 9×9 solution and removes cells to produce a puzzle. If you want difficulty levels, animations, or a solver UI, I can add those next.
 - The app now uses a backtracking generator to create a full 9×9 solution and removes cells to produce a puzzle.
 - Difficulty levels: select `Easy`, `Medium`, or `Hard` in the header before pressing `New`.
	 - Easy: fewer removals (more clues)
	 - Medium: balanced
	 - Hard: more removals (fewer clues)
 - Controls: `Hint` fills one random empty cell, `Solve` reveals the full solution, and `Check` validates current board highlighting conflicts.

Floating window behavior

- The game runs inside a draggable floating window. Drag by the header to reposition it anywhere on the page.
- Use the minimize button to collapse the window to a compact header-only view.
- Use the close button to hide the window; reopen it with the `Open Sudoku` dock button at the bottom-right.
- Window position, minimized, and hidden state persist between page loads using `localStorage`.
