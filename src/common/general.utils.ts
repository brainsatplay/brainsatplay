export function createRoute (path:string, remote:string|URL) {
  let baseUrl = (remote instanceof URL) ? remote : new URL(remote)
    path = (baseUrl.pathname === '/') ? path : baseUrl.pathname + path
    let href = (new URL(path, baseUrl.href)).href
    return href
  }

  export function getRouteMatches(route, specifierIncluded=true) {

        // Remove Wildcards
        route = route.replace(/\/\*\*?/, '')

        // Split and Remote Specifier
        let split = route.split('/')
        if (specifierIncluded) split = split.slice(0,split.length-1) // Remove specified thing at the route

        // Get Main Routes
        let matches = [route]
        matches.push(route + '/*')
        matches.push(route + '/**')

        split.forEach((_,i) => {
            let slice = split.slice(0,i+1).join('/')

            if (slice != route){
              if (i === split.length - 1) matches.push(slice + '/*')
              matches.push(slice + '/**')
            }

        })
        return matches
  }