# Terminal RSS

A simple RSS client that runs in the terminal and fetches rss entries with their links and descriptions.

## Dependencies

- chalk ([GitHub](https://github.com/chalk/chalk))
- jsdom ([GitHub](https://github.com/jsdom/jsdom))
- string-length ([GitHub](https://github.com/sindresorhus/string-length))
- string-width ([GitHub](https://github.com/sindresorhus/string-width))

## Installation

- Clone the repository
- npm install
- Run main.js with node or npm start

## Videos

![]

![]

## Usage

### Starting the RSS Client

To start the client run the program with one argument consisting of an URL.

If the URL is a regular website, the client will attempt to find the site's RSS Feed URL in the source code.

Otherwise, if it's already an RSS Feed URL, the Feed will be fetched and parsed by the client.

*Depending on the feed, there are cases where the client fails to parse some/any entries.*

Example:

```
$ npm start http://www.cnet.com/rss/news
```

After the feed is displayed, you can access the links with Ctrl+LeftClick.

### Updating the Feed

To attempt to fetch new entries from the feed, you can use the command:

```
update
```

This will send a new request to the RSS Feed. This request uses the 'If-Modified-Since' header in an attempt to prevent overloading.

The client preserves the read/unread status of entries that were already in the Feed and were marked as such by the user.

### Marking entries as read

To mark an entry as read you can type the following command: 

```
read-#
```

Where # is the index of the entry, shown to the left of the title.

You can tell if an entry has been marked as read if it no longer displays the yellow * mark before its index number.

You can also mark all entries as read at once:

```
read-all
```

### Marking entries as unread

Likewise, you can mark an entry as unread with the command:

```
unread-#
```

Where # is again the index of the entry.

Unread entries will display the yellow * mark before its index number.

To unread all entries:

```
unread-all
```

### Toggling display of read entries

To hide all entries currently marked as read, use the following command:

```
hide
```

To show all entries again:

```
show
```
