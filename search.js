'use strict'
const fs = require('fs')
const os = require('os')
const traverse = require('traverse')

let file = ''

if (os.platform() === 'darwin') {
    file = '~/Library/Application Support/Google/Chrome/Default/Bookmarks'
} else if (os.platform() === 'linux') {
    file = '~/.config/google-chrome/Default/Bookmarks'
}

module.exports = (pluginContext) => {
    return {
        respondsTo: (query, env = {}) => {
            return true
        },
        search: (query, env) => {
            if (query.length === 0) return Promise.resolve([])
            const variables = env || {}
            const bookmarkFile = (variables['file'] || file).replace(/^~/, os.homedir())
            return new Promise((resolve, reject) => {
                fs.readFile(bookmarkFile, (err, data) => {
                    const rawData = JSON.parse(data)
                    // Find
                    const bookmarks = []
                    traverse(rawData).forEach((item) => {
                        const isBookmark = item['type'] === 'url'
                        if (isBookmark) {
                            const bookmark = {
                                id: query + item['url'],
                                title: item['name'],
                                subtitle: item['url'],
                                value: item['url'],
                            }
                            bookmarks.push(bookmark)
                        }
                    })

                    // Filter
                    const query_words = query.split(' ')
                    const filteredBookmarks = bookmarks.filter(bookmark => (
                        query_words.every(
                            word => bookmark.title.indexOf(word) !== -1
                                || bookmark.subtitle.indexOf(word) !== -1)))
                    resolve(filteredBookmarks)
                })
            })
        }
    }
}
