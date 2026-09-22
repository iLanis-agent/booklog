/* BookLog engine - pure functions for reading pace and finish projections. */
(function (root) {
  'use strict';
  var DAY = 86400000;
  var nextId = 1;
  function uid() { return 'b' + (nextId++) + '-' + Math.random().toString(36).slice(2, 8); }
  function days(later, earlier) {
    return Math.round((new Date(later + 'T00:00:00Z') - new Date(earlier + 'T00:00:00Z')) / DAY);
  }
  function plusDays(date, n) {
    return new Date(new Date(date + 'T00:00:00Z').getTime() + n * DAY).toISOString().slice(0, 10);
  }

  function addBook(list, title, totalPages) {
    title = (title || '').trim();
    totalPages = Number(totalPages);
    if (!title) throw new Error('book needs a title');
    if (!isFinite(totalPages) || totalPages < 1 || totalPages > 100000) throw new Error('total pages must be 1..100000');
    var b = { id: uid(), title: title, totalPages: Math.round(totalPages), currentPage: 0, history: [] };
    list.push(b);
    return b;
  }

  function removeBook(list, id) {
    var n = list.length;
    var kept = list.filter(function (b) { return b.id !== id; });
    list.length = 0;
    kept.forEach(function (b) { list.push(b); });
    return kept.length < n;
  }

  // log where you are; page may not go backwards
  function logPage(book, date, page) {
    page = Number(page);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('date must be YYYY-MM-DD');
    if (!isFinite(page) || page < 0) throw new Error('page must be >= 0');
    page = Math.round(page);
    if (page > book.totalPages) throw new Error('page is past the end of the book');
    if (page < book.currentPage) throw new Error('page cannot go backwards (currently ' + book.currentPage + ')');
    book.currentPage = page;
    book.history.push({ date: date, page: page });
    return book;
  }

  function status(book) {
    if (book.currentPage >= book.totalPages) return 'finished';
    if (book.currentPage > 0) return 'reading';
    return 'not started';
  }

  // pages per day over the recent window (last 14 days), falling back to overall
  function pace(book, today) {
    if (book.history.length < 2) return null;
    var recent = book.history.filter(function (h) { return days(today, h.date) <= 14; });
    var h = recent.length >= 2 ? recent : book.history;
    var first = h[0], last = h[h.length - 1];
    var span = days(last.date, first.date);
    if (span < 1) return null;
    return (last.page - first.page) / span;
  }

  // finish projection from current pace
  function projection(book, today) {
    if (status(book) === 'finished') return { status: 'finished' };
    var p = pace(book, today);
    if (p === null || p <= 0) return { status: status(book), pace: null, finishDate: null, daysLeft: null };
    var remaining = book.totalPages - book.currentPage;
    var daysLeft = Math.ceil(remaining / p);
    return {
      status: status(book),
      pace: Math.round(p * 10) / 10,
      daysLeft: daysLeft,
      finishDate: plusDays(today, daysLeft),
      pct: Math.round((book.currentPage / book.totalPages) * 100)
    };
  }

  var api = { addBook: addBook, removeBook: removeBook, logPage: logPage, status: status, pace: pace, projection: projection };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BookLog = api;
})(typeof window !== 'undefined' ? window : this);
