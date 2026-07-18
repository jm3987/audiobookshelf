const { expect } = require('chai')
const libraryItemsBookFilters = require('../../../../server/utils/queries/libraryItemsBookFilters')

describe('libraryItemsBookFilters composable filters', () => {
  it('ORs included values in the same group', () => {
    const result = libraryItemsBookFilters.getComposableFilterQuery([
      { group: 'genres', value: 'Fantasy', exclude: false },
      { group: 'genres', value: 'Romance', exclude: false }
    ])

    expect(result.bookWhere).to.have.length(1)
    expect(result.bookWhere[0].val).to.include('json_each(book.genres)')
    expect(result.replacements.multiFilter_genres_include).to.deep.equal(['Fantasy', 'Romance'])
  })

  it('ANDs conditions from different groups', () => {
    const result = libraryItemsBookFilters.getComposableFilterQuery([
      { group: 'genres', value: 'Fantasy', exclude: false },
      { group: 'languages', value: 'English', exclude: false }
    ])

    expect(result.bookWhere).to.have.length(2)
    expect(result.bookWhere[0].val).to.include('json_each(book.genres)')
    expect(result.bookWhere[1].val).to.include('book.language IN')
  })

  it('creates negative conditions for excluded values', () => {
    const result = libraryItemsBookFilters.getComposableFilterQuery([
      { group: 'tags', value: 'Young Adult', exclude: true },
      { group: 'authors', value: 'author-id', exclude: true }
    ])

    expect(result.bookWhere).to.have.length(2)
    expect(result.bookWhere[0].val).to.include('NOT EXISTS')
    expect(result.bookWhere[0].val).to.include('json_each(book.tags)')
    expect(result.bookWhere[1].val).to.include('NOT EXISTS')
    expect(result.bookWhere[1].val).to.include('bookAuthors')
  })

  it('supports including books with no series', () => {
    const result = libraryItemsBookFilters.getComposableFilterQuery([{ group: 'series', value: 'no-series', exclude: false }])

    expect(result.bookWhere).to.have.length(1)
    expect(result.bookWhere[0].val).to.equal('NOT EXISTS (SELECT 1 FROM bookSeries WHERE bookSeries.bookId = book.id)')
  })
})
