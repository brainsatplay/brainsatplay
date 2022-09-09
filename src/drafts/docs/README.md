# @brainsatplay/docs

The goal of this project is to autogenerate documentation for Brains@Play applications as they recompose the web. This allows developers to generate thorough documentation automatically!

> **Note**: This is still just a mockup of a docs generation API. It's not gonna really work how you want (yet)!

Uses https://showdownjs.com/ to generate HTML from .md files.

## Roadmap
- Check out [ESDoc](https://esdoc.org/)
- Aggregate documentation from across all of our repositories into one distribution. 
    - Implement link crawling, so you download remote links based on a specific pattern (e.g. look for "github.com/brainsatplay")
-  Editor with active plug-in + generated explanation from WASL file (see [htil](https://github.com/brainsatplay/htil)).