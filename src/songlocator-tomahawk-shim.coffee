###
  Shim which allows to re-use tomahawk resolvers almost "as-is".
###

XMLHttpRequest = XMLHttpRequest or require('xmlhttprequest').XMLHttpRequest
{BaseResolver, extend} = require 'songlocator-base'

exports.window = if window? then window else {localStorage: {}, sessionStorage: {}}

exports.Tomahawk =

  resolver: {}

  readBase64: ->
    undefined

  extend: (base, obj) ->
    class AdaptedResolver extends BaseResolver
      constructor: (settings = {}) ->
        this.init()
        this.settings = extend({}, (this.settings or {}), settings)
    extend(AdaptedResolver.prototype, base, obj)
    AdaptedResolver

  log: (message) ->
    #console.log message

  asyncRequest: (url, callback, extraHeaders) ->
    xmlHttpRequest = new XMLHttpRequest()
    xmlHttpRequest.open('GET', url, true)
    if extraHeaders
      for headerName in extraHeaders
        xmlHttpRequest.setRequestHeader(headerName, extraHeaders[headerName])

    xmlHttpRequest.onreadystatechange = ->
      if xmlHttpRequest.readyState == 4 and xmlHttpRequest.status == 200
        callback.call(exports.window, xmlHttpRequest)
      else if xmlHttpRequest.readyState == 4
        exports.Tomahawk.log("Failed to do GET request: to: " + url)
        exports.Tomahawk.log("Status Code was: " + xmlHttpRequest.status)
    xmlHttpRequest.send(null)

exports.TomahawkResolver =
  init: ->
  scriptPath: ->
    ''
  getConfigUi: ->
    {}

  getUserConfig: ->
    {}

  saveUserConfig: ->

  newConfigSaved: ->

  resolve: (qid, artist, album, title) ->
    {qid: qid}

  search: (qid, searchString) ->
    this.resolve(qid, "", "", searchString)

  addTrackResults: (results) ->
    # some resolvers could be not so nice
    if results.results
      results.results = results.results.filter (r) -> r
    this.emit 'results', results
