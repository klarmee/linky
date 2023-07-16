import { useState, useEffect, useRef, Fragment } from 'react';
export default function Textarea() {
  const timeRef = useRef(undefined);
  const counter = useRef(0);
  const selection = useRef('');
  const [state, setState] = useState([{ id: null, html: null }])

  useEffect(() => {
    window.addEventListener('load', init)
    window.addEventListener('beforeunload', confirmExit);
    document.addEventListener('selectionchange', handleSelection);
    return () => {
      window.removeEventListener('load', init)
      window.removeEventListener('beforeunload', confirmExit);
      document.removeEventListener('selectionchange', handleSelection);
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    }
  }, [state])

  return (
    <>
      {
        state.map((link, i) => {
          if (link.html) return (
            <div dangerouslySetInnerHTML={{ __html: link.html }} id={link.id} data-index={i} key={i} spellCheck='false' className={'div ' + link.id} contentEditable='true' tabIndex='1' suppressContentEditableWarning={true} />
          )
          else return (
            <div id={link.id} data-index={i} key={i} spellCheck='false' className={'div ' + link.id} contentEditable='true' tabIndex='1' suppressContentEditableWarning={true}>
              {link.id}
            </div>
          )
        })
      }
    </>
  )

  function handleKeydown(e) {
    link(e)
    unLink(e)
    saveToStorage()
  }
  function init() {
    loadFromStorage()
    initFocus()
  }
  function link(e) {
    if (e.ctrlKey && e.key === 'l') {
      var newId = selection.current.toString()
      let idExists = state.find(link => link.id == newId)
      console.log(idExists)
      if (idExists == undefined && newId == encodeURIComponent(newId)) {
        replaceTextWithLink(newId)
        setState([...state, { id: newId }])
        addStyle(newId)
        e.preventDefault()
      }
      window.localStorage.setItem(newId + '-style', document.querySelector('style.' + newId).innerHTML)
    }
  }
  function unLink(e) {
    if (e.key === 'Backspace' && document.activeElement.innerText == '' && document.activeElement.id) {
      var id = document.activeElement.id
      placeCaretAtEnd(document.activeElement.previousSibling)
      if (document.querySelector(`a.${id}`)) document.querySelector(`a.${id}`).replaceWith(id)
      let newState = state.filter(link => link.id !== id)
      setState(newState)
      window.localStorage.removeItem(id + '-style')
    }
  }
  function saveToStorage() {
    if (timeRef.current !== undefined) {
      clearTimeout(timeRef.current)
      timeRef.current = undefined
    }
    timeRef.current = setTimeout(
      () => {
        let newState = []
        Array.from(document.querySelectorAll('.div')).forEach((div) => {
          newState.push({ id: div.id, html: div.innerHTML })
        })
        window.localStorage.setItem("state", JSON.stringify(newState))
      },
      200
    )
  };

  function loadFromStorage() {
    if (window.localStorage.getItem("state")) {
      setState(JSON.parse(window.localStorage.getItem("state")))
      JSON.parse(window.localStorage.getItem("state")).map(link => {
        if (window.localStorage.getItem(link.id + "-style")) {
          console.log(window.localStorage.getItem(link.id + "-style"));
          let style = document.createElement('style')
          style.innerHTML = window.localStorage.getItem(link.id + "-style")
          document.head.append(style)
        }
      })
    }
  }
  function initFocus() {
    setTimeout(function () {
      document.querySelectorAll('.div')[0].focus();
    }, 0);
  }

  function confirmExit() {
    return "exit?";
  }
  function handleSelection() {
    const currentSelection = document.getSelection()
    if (currentSelection) {
      selection.current = currentSelection;
    }
  }





  function addStyle(className) {
    var styleSheet = document.createElement("style")
    styleSheet.className = className
    var hue = `hsl(${counter.current}, 50%, 50%)`
    styleSheet.innerText = `a.${className}{border-bottom:solid ${hue};}div.${className}{border-left:solid ${hue};}`
    document.head.appendChild(styleSheet)
    counter.current += 207
  }

  function replaceTextWithLink(id) {
    var sel, range;
    let a = document.createElement('a')
    a.href = '#' + id
    a.className = a.innerText = id
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(a);
      }
    } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = a;
    }
  }

  function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  }
}