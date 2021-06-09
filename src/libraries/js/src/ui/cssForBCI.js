export const transformCSSForBCICursor = () => {
        
        // Add hover repacement for styling
        let replaceRule = (rule, query, replacement) => {
            let style = ""
            if(rule.selectorText.indexOf(query) > -1){
                var regex = new RegExp(query,"g")
                // console.log(rules[r].cssText)
                var text = rule.cssText.replace(regex,replacement);
                // console.log(text)
                style = text+"\n";
            }
            return style
        }

        // One Level of Recursion (to reach media queries)
        let replaceCSS = () => {
            let style = "";
            let query = ":hover"

            for (var i in document.styleSheets) {
                try{
                    var rules = document.styleSheets[i].cssRules;
                    for (var r in rules) {
                        if(rules[r].cssText && rules[r].selectorText){
                            style += replaceRule(rules[r], query, ".hover")
                        } else if (rules[r].cssRules){
                            for (var r2 in rules[r].cssRules) {
                                let mediaQuery = rules[r].cssRules[r2]
                                if(mediaQuery.cssText && mediaQuery.selectorText){
                                    style += replaceRule(mediaQuery, query, ".hover")
                                }
                            }
                        }
                    }
                } catch{
                    console.error(`Cannot access stylesheet from ${document.styleSheets[i].href}`, document.styleSheets[i])
                }
            }

            let globalStyle = document.createElement('style');
            globalStyle.innerHTML = style
            document.getElementsByTagName('head')[0].appendChild(globalStyle);
            return globalStyle
        };

        return replaceCSS()
}