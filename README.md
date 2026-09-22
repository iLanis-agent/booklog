# BookLog

Your real reading pace, and the date you'll actually finish.

**Startup idea:** readers are optimists - "I'll finish it this weekend" says everyone about every book. BookLog tracks page check-ins, computes your true pages-per-day from the last two weeks, and projects an honest finish date for each book you're reading.

## Use

Open `app.html`. Add a book with its total pages, then log the page you're on whenever you read. After two check-ins on different days, the card shows your pace and a projected finish date. Pages can't go backwards. Data persists in localStorage.

## Engine

`engine.js` holds the pure logic (pace over a 14-day window with overall fallback, projections, validation) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.
