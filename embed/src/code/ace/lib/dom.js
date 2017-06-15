/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

var XHTML_NS = 'http://www.w3.org/1999/xhtml'

export var getDocumentHead = function(doc) {
  if (!doc) doc = document
  return doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement
}

export var createElement = function(tag, ns) {
  return document.createElementNS
    ? document.createElementNS(ns || XHTML_NS, tag)
    : document.createElement(tag)
}

export var hasCssClass = function(el, name) {
  var classes = (el.className + '').split(/\s+/g)
  return classes.indexOf(name) !== -1
}

/*
 * Add a CSS class to the list of classes on the given node
 */
export var addCssClass = function(el, name) {
  if (!hasCssClass(el, name)) {
    el.className += ' ' + name
  }
}

/*
 * Remove a CSS class from the list of classes on the given node
 */
export var removeCssClass = function(el, name) {
  var classes = el.className.split(/\s+/g)
  while (true) {
    var index = classes.indexOf(name)
    if (index == -1) {
      break
    }
    classes.splice(index, 1)
  }
  el.className = classes.join(' ')
}

export var toggleCssClass = function(el, name) {
  var classes = el.className.split(/\s+/g),
    add = true
  while (true) {
    var index = classes.indexOf(name)
    if (index == -1) {
      break
    }
    add = false
    classes.splice(index, 1)
  }
  if (add) classes.push(name)

  el.className = classes.join(' ')
  return add
}

/*
 * Add or remove a CSS class from the list of classes on the given node
 * depending on the value of <tt>include</tt>
 */
export var setCssClass = function(node, className, include) {
  if (include) {
    addCssClass(node, className)
  } else {
    removeCssClass(node, className)
  }
}

export var hasCssString = function(id, doc) {
  var index = 0,
    sheets
  doc = doc || document

  if (doc.createStyleSheet && (sheets = doc.styleSheets)) {
    while (index < sheets.length)
      if (sheets[index++].owningElement.id === id) return true
  } else if ((sheets = doc.getElementsByTagName('style'))) {
    while (index < sheets.length) if (sheets[index++].id === id) return true
  }

  return false
}

export var importCssString = function importCssString(cssText, id, doc) {
  doc = doc || document
  // If style is already imported return immediately.
  if (id && hasCssString(id, doc)) return null

  var style

  if (id) cssText += '\n/*# sourceURL=ace/css/' + id + ' */'

  if (doc.createStyleSheet) {
    style = doc.createStyleSheet()
    style.cssText = cssText
    if (id) style.owningElement.id = id
  } else {
    style = createElement('style')
    style.appendChild(doc.createTextNode(cssText))
    if (id) style.id = id

    getDocumentHead(doc).appendChild(style)
  }
}

export var importCssStylsheet = function(uri, doc) {
  if (doc.createStyleSheet) {
    doc.createStyleSheet(uri)
  } else {
    var link = createElement('link')
    link.rel = 'stylesheet'
    link.href = uri

    getDocumentHead(doc).appendChild(link)
  }
}

export var getInnerWidth = function(element) {
  return (
    parseInt(computedStyle(element, 'paddingLeft'), 10) +
    parseInt(computedStyle(element, 'paddingRight'), 10) +
    element.clientWidth
  )
}

export var getInnerHeight = function(element) {
  return (
    parseInt(computedStyle(element, 'paddingTop'), 10) +
    parseInt(computedStyle(element, 'paddingBottom'), 10) +
    element.clientHeight
  )
}

export var scrollbarWidth = function(document) {
  var inner = createElement('ace_inner')
  inner.style.width = '100%'
  inner.style.minWidth = '0px'
  inner.style.height = '200px'
  inner.style.display = 'block'

  var outer = createElement('ace_outer')
  var style = outer.style

  style.position = 'absolute'
  style.left = '-10000px'
  style.overflow = 'hidden'
  style.width = '200px'
  style.minWidth = '0px'
  style.height = '150px'
  style.display = 'block'

  outer.appendChild(inner)

  var body = document.documentElement
  body.appendChild(outer)

  var noScrollbar = inner.offsetWidth

  style.overflow = 'scroll'
  var withScrollbar = inner.offsetWidth

  if (noScrollbar == withScrollbar) {
    withScrollbar = outer.clientWidth
  }

  body.removeChild(outer)

  return noScrollbar - withScrollbar
}

export var getPageScrollTop = function() {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : document.body.scrollTop
}

export var getPageScrollLeft = function() {
  return window.pageXOffset !== undefined
    ? window.pageXOffset
    : document.body.scrollLeft
}

export var computedStyle = function(element, style) {
  if (style) return (window.getComputedStyle(element, '') || {})[style] || ''
  return window.getComputedStyle(element, '') || {}
}

/*
 * Optimized set innerHTML. This is faster than plain innerHTML if the element
 * already contains a lot of child elements.
 *
 * See http://blog.stevenlevithan.com/archives/faster-than-innerhtml for details
 */
export var setInnerHtml = function(el, innerHtml) {
  var element = el.cloneNode(false) //document.createElement("div");
  element.innerHTML = innerHtml
  el.parentNode.replaceChild(element, el)
  return element
}

export var setInnerText = function(el, innerText) {
  if ('textContent' in document.documentElement) {
    el.textContent = innerText
  } else {
    el.innerText = innerText
  }
}

export var getInnerText = function(el) {
  if ('textContent' in document.documentElement) {
    return el.textContent
  } else {
    return el.innerText
  }
}

export var getParentWindow = function(document) {
  return document.defaultView || document.parentWindow
}
