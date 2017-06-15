export const OTHER_USERS_COLORS = ['#D000FF', '#51FF00', '#FFB700', '#FF0080']

const CURSORS = OTHER_USERS_COLORS.map(
  (c, i) => `.ace_editor .other-user-cursor-${i} {
  position: absolute;
  border-left: 2px solid ${c};
  border-radius: 0;
}
.ace_editor .other-user-selection-left-${i} {
  position: absolute;
  /* background-color: #414042; */
  border-radius: 0;
}
.ace_editor .other-user-selection-left-${i}:first-of-type {
  border-left: 2px solid ${c};
}
.ace_editor .other-user-selection-right-${i} {
  position: absolute;
  /* background-color: #414042; */
  border-radius: 0;
}
.ace_editor .other-user-selection-right-${i}:last-of-type {
  border-right: 2px solid ${c};
}`
).join('\n')

const search = `
/* ------------------------------------------------------------------------------------------
 * Editor Search Form
 * --------------------------------------------------------------------------------------- */
.ace_search {
    background-color: #ddd;
    border: 1px solid #cbcbcb;
    border-top: 0 none;
    max-width: 325px;
    overflow: hidden;
    margin: 0;
    padding: 4px;
    padding-right: 6px;
    padding-bottom: 0;
    position: absolute;
    top: 0px;
    z-index: 99;
    white-space: normal;
}
.ace_search.left {
    border-left: 0 none;
    border-radius: 0px 0px 5px 0px;
    left: 0;
}
.ace_search.right {
    border-radius: 0px 0px 0px 5px;
    border-right: 0 none;
    right: 0;
}

.ace_search_form, .ace_replace_form {
    border-radius: 3px;
    border: 1px solid #cbcbcb;
    float: left;
    margin-bottom: 4px;
    overflow: hidden;
}
.ace_search_form.ace_nomatch {
    outline: 1px solid red;
}

.ace_search_field {
    background-color: white;
    color: black;
    border-right: 1px solid #cbcbcb;
    border: 0 none;
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
            box-sizing: border-box;
    float: left;
    height: 22px;
    outline: 0;
    padding: 0 7px;
    width: 214px;
    margin: 0;
}
.ace_searchbtn,
.ace_replacebtn {
    background: #fff;
    border: 0 none;
    border-left: 1px solid #dcdcdc;
    cursor: pointer;
    float: left;
    height: 22px;
    margin: 0;
    position: relative;
}
.ace_searchbtn:last-child,
.ace_replacebtn:last-child {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
}
.ace_searchbtn:disabled {
    background: none;
    cursor: default;
}
.ace_searchbtn {
    background-position: 50% 50%;
    background-repeat: no-repeat;
    width: 27px;
}
.ace_searchbtn.prev {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpiSU1NZUAC/6E0I0yACYskCpsJiySKIiY0SUZk40FyTEgCjGgKwTRAgAEAQJUIPCE+qfkAAAAASUVORK5CYII=);    
}
.ace_searchbtn.next {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAFCAYAAAB4ka1VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADRJREFUeNpiTE1NZQCC/0DMyIAKwGJMUAYDEo3M/s+EpvM/mkKwCQxYjIeLMaELoLMBAgwAU7UJObTKsvAAAAAASUVORK5CYII=);    
}
.ace_searchbtn_close {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAcCAYAAABRVo5BAAAAZ0lEQVR42u2SUQrAMAhDvazn8OjZBilCkYVVxiis8H4CT0VrAJb4WHT3C5xU2a2IQZXJjiQIRMdkEoJ5Q2yMqpfDIo+XY4k6h+YXOyKqTIj5REaxloNAd0xiKmAtsTHqW8sR2W5f7gCu5nWFUpVjZwAAAABJRU5ErkJggg==) no-repeat 50% 0;
    border-radius: 50%;
    border: 0 none;
    color: #656565;
    cursor: pointer;
    float: right;
    font: 16px/16px Arial;
    height: 14px;
    margin: 5px 1px 9px 5px;
    padding: 0;
    text-align: center;
    width: 14px;
}
.ace_searchbtn_close:hover {
    background-color: #656565;
    background-position: 50% 100%;
    color: white;
}
.ace_replacebtn.prev {
    width: 54px
}
.ace_replacebtn.next {
    width: 27px
}

.ace_button {
    margin-left: 2px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    -ms-user-select: none;
    user-select: none;
    overflow: hidden;
    opacity: 0.7;
    border: 1px solid rgba(100,100,100,0.23);
    padding: 1px;
    -moz-box-sizing: border-box;
    box-sizing:    border-box;
    color: black;
}

.ace_button:hover {
    background-color: #eee;
    opacity:1;
}
.ace_button:active {
    background-color: #ddd;
}

.ace_button.checked {
    border-color: #3399ff;
    opacity:1;
}

.ace_search_options{
    margin-bottom: 3px;
    text-align: right;
    -webkit-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    -ms-user-select: none;
    user-select: none;
}`

export default `
${search}
.ace_snippet-marker {
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    background: rgba(194, 193, 208, 0.09);
    border: 1px dotted rgba(211, 208, 235, 0.62);
    position: absolute;
}
.ace_editor {
    position: relative;
    overflow: hidden;
    font: 12px/normal 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    direction: ltr;
    text-align: left;
}

.ace_scroller {
    position: absolute;
    overflow: hidden;
    top: 0;
    bottom: 0;
    background-color: inherit;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    cursor: text;
}

.ace_content {
    position: absolute;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    min-width: 100%;
}

.ace_dragging .ace_scroller:before{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    content: '';
    background: rgba(250, 250, 250, 0.01);
    z-index: 1000;
}
.ace_dragging.ace_dark .ace_scroller:before{
    background: rgba(0, 0, 0, 0.01);
}

.ace_selecting, .ace_selecting * {
    cursor: text !important;
}

.ace_gutter {
    position: absolute;
    overflow : hidden;
    top: 0;
    bottom: 0;
    left: 0;
    cursor: default;
    z-index: 4;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    width: 40px;
}

.ace_gutter-active-line {
    position: absolute;
    left: 0;
    right: 0;
}

.ace_scroller.ace_scroll-left {
    box-shadow: 17px 0 16px -16px rgba(0, 0, 0, 0.4) inset;
}

.ace_gutter-cell {
}

.ace_scrollbar {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 6;
}

.ace_scrollbar-inner {
    position: absolute;
    cursor: text;
    left: 0;
    top: 0;
}

.ace_scrollbar-v{
    overflow-x: hidden;
    overflow-y: scroll;
    top: 0;
}

.ace_scrollbar-h {
    overflow-x: scroll;
    overflow-y: hidden;
    left: 0;
}

.ace_print-margin {
    position: absolute;
    height: 100%;
}

.ace_text-input {
    position: absolute;
    z-index: 0;
    width: 0.5em;
    height: 1em;
    opacity: 0;
    background: transparent;
    -moz-appearance: none;
    appearance: none;
    border: none;
    resize: none;
    outline: none;
    overflow: hidden;
    font: inherit;
    padding: 0 1px;
    margin: 0 -1px;
    text-indent: -1em;
    -ms-user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;
    user-select: text;
    /*with pre-line chrome inserts &nbsp; instead of space*/
    white-space: pre!important;
}

.ace_text-input.ace_composition {
    background: inherit;
    color: inherit;
    z-index: 1000;
    opacity: 1;
    text-indent: 0;
}

.ace_layer {
    z-index: 1;
    position: absolute;
    overflow: hidden;
    /* workaround for chrome bug https://github.com/ajaxorg/ace/issues/2312*/
    word-wrap: normal;
    white-space: pre;
    height: 100%;
    width: 100%;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    /* setting pointer-events: auto; on node under the mouse, which changes
        during scroll, will break mouse wheel scrolling in Safari */
    pointer-events: none;
}

.ace_gutter-layer {
    position: relative;
    width: 32px !important;
    text-align: right;
    pointer-events: auto;
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.25s ease-out 0.3s;
}
.ace_gutter:hover .ace_gutter-layer {
  transform: translateX(0);
  opacity: 1;
}

.ace_text-layer {
    font: inherit !important;
}

.ace_cjk {
    display: inline-block;
    text-align: center;
}

.ace_cursor-layer {
    z-index: 4;
}

.ace_cursor {
    z-index: 4;
    position: absolute;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-left: 2px solid;
    /* workaround for smooth cursor repaintng whole screen in chrome */
    transform: translatez(0);
}

.ace_slim-cursors .ace_cursor {
    border-left-width: 1px;
}

.ace_overwrite-cursors .ace_cursor {
    border-left-width: 0;
    border-bottom: 1px solid;
}

.ace_hidden-cursors .ace_cursor {
    opacity: 0.2;
}

.ace_smooth-blinking .ace_cursor {
    -webkit-transition: opacity 0.18s;
            transition: opacity 0.18s;
}

.ace_editor.ace_multiselect .ace_cursor {
    border-left-width: 1px;
}

.ace_marker-layer .ace_step, .ace_marker-layer .ace_stack {
    position: absolute;
    z-index: 3;
}

.ace_marker-layer .ace_selection {
    position: absolute;
    z-index: 5;
}

.ace_marker-layer .ace_bracket {
    position: absolute;
    z-index: 6;
}

.ace_marker-layer .ace_active-line {
    position: absolute;
    z-index: 2;
}

.ace_marker-layer .ace_selected-word {
    position: absolute;
    z-index: 4;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}

.ace_line .ace_fold {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;

    display: inline-block;
    height: 11px;
    margin-top: -2px;
    vertical-align: middle;

    background-image:
        url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),
        url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACJJREFUeNpi+P//fxgTAwPDBxDxD078RSX+YeEyDFMCIMAAI3INmXiwf2YAAAAASUVORK5CYII=");
    background-repeat: no-repeat, repeat-x;
    background-position: center center, top left;
    color: transparent;

    border: 1px solid black;
    border-radius: 2px;

    cursor: pointer;
    pointer-events: auto;
}

.ace_dark .ace_fold {
}

.ace_fold:hover{
    background-image:
        url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),
        url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACBJREFUeNpi+P//fz4TAwPDZxDxD5X4i5fLMEwJgAADAEPVDbjNw87ZAAAAAElFTkSuQmCC");
}

.ace_tooltip {
    background-color: #FFF;
    background-image: -webkit-linear-gradient(top, transparent, rgba(0, 0, 0, 0.1));
    background-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));
    border: 1px solid gray;
    border-radius: 1px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    color: black;
    max-width: 100%;
    padding: 3px 4px;
    position: fixed;
    z-index: 999999;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: default;
    white-space: pre;
    word-wrap: break-word;
    line-height: normal;
    font-style: normal;
    font-weight: normal;
    letter-spacing: normal;
    pointer-events: none;
}

.ace_fold-widget {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;

    margin: 0 -12px 0 1px;
    display: none;
    width: 11px;
    vertical-align: top;

    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42mWKsQ0AMAzC8ixLlrzQjzmBiEjp0A6WwBCSPgKAXoLkqSot7nN3yMwR7pZ32NzpKkVoDBUxKAAAAABJRU5ErkJggg==");
    background-repeat: no-repeat;
    background-position: center;

    border-radius: 3px;
    
    border: 1px solid transparent;
    cursor: pointer;
}

.ace_folding-enabled .ace_fold-widget {
    display: inline-block;   
}

.ace_fold-widget.ace_end {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42m3HwQkAMAhD0YzsRchFKI7sAikeWkrxwScEB0nh5e7KTPWimZki4tYfVbX+MNl4pyZXejUO1QAAAABJRU5ErkJggg==");
}

.ace_fold-widget.ace_closed {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAGCAYAAAAG5SQMAAAAOUlEQVR42jXKwQkAMAgDwKwqKD4EwQ26sSOkVWjgIIHAzPiCgaqiqnJHZnKICBERHN194O5b9vbLuAVRL+l0YWnZAAAAAElFTkSuQmCCXA==");
}

.ace_fold-widget:hover {
    border: 1px solid rgba(0, 0, 0, 0.3);
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
}

.ace_fold-widget:active {
    border: 1px solid rgba(0, 0, 0, 0.4);
    background-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

.ace_fold-widget.ace_invalid {
    background-color: #FFB4B4;
    border-color: #DE5555;
}

.ace_fade-fold-widgets .ace_fold-widget {
    -webkit-transition: opacity 0.4s ease 0.05s;
            transition: opacity 0.4s ease 0.05s;
    opacity: 0;
}

.ace_fade-fold-widgets:hover .ace_fold-widget {
    -webkit-transition: opacity 0.05s ease 0.05s;
            transition: opacity 0.05s ease 0.05s;
    opacity:1;
}

.ace_underline {
    text-decoration: underline;
}

.ace_bold {
    font-weight: bold;
}

.ace_nobold .ace_bold {
    font-weight: normal;
}

.ace_italic {
    font-style: italic;
}


.ace_error-marker {
    background-color: rgba(255, 0, 0,0.2);
    position: absolute;
    z-index: 9;
}

.ace_highlight-marker {
    background-color: rgba(255, 255, 0,0.2);
    position: absolute;
    z-index: 8;
}

.ace_br1 {border-top-left-radius    : 3px;}
.ace_br2 {border-top-right-radius   : 3px;}
.ace_br3 {border-top-left-radius    : 3px; border-top-right-radius:    3px;}
.ace_br4 {border-bottom-right-radius: 3px;}
.ace_br5 {border-top-left-radius    : 3px; border-bottom-right-radius: 3px;}
.ace_br6 {border-top-right-radius   : 3px; border-bottom-right-radius: 3px;}
.ace_br7 {border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px;}
.ace_br8 {border-bottom-left-radius : 3px;}
.ace_br9 {border-top-left-radius    : 3px; border-bottom-left-radius:  3px;}
.ace_br10{border-top-right-radius   : 3px; border-bottom-left-radius:  3px;}
.ace_br11{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-left-radius:  3px;}
.ace_br12{border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}
.ace_br13{border-top-left-radius    : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}
.ace_br14{border-top-right-radius   : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}
.ace_br15{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px;}

/* idle_fingers */
.ace_editor .ace_gutter {
  background: #3b3b3b;
  color: rgb(153,153,153)
}

.ace_editor .ace_print-margin {
  width: 1px;
  background: #3b3b3b
}

.ace_editor {
  background-color: #323232;
  color: #FFFFFF
}

.ace_editor .ace_cursor {
  color: #00FFD0;
}

.ace_editor .ace_marker-layer .ace_selection {
  background-color: #414042;
}

.ace_editor.ace_multiselect .ace_selection.ace_start {
  box-shadow: 0 0 3px 0px #323232;
}

.ace_editor .ace_marker-layer .ace_step {
  background: rgb(102, 82, 0)
}

.ace_editor .ace_marker-layer .ace_bracket {
  margin: -1px 0 0 -1px;
  border: 1px solid #404040
}

.ace_editor .ace_marker-layer .ace_active-line {
  background: #353637
}

.ace_editor .ace_marker-layer .ace_selected-word {
  border: 1px solid rgba(90, 100, 126, 0.88)
}

.ace_editor .ace_invisible {
  color: #404040
}

.ace_editor .ace_keyword,
.ace_editor .ace_meta {
  color: #CC7833
}

.ace_editor .ace_constant,
.ace_editor .ace_constant.ace_character,
.ace_editor .ace_constant.ace_character.ace_escape,
.ace_editor .ace_constant.ace_other,
.ace_editor .ace_support.ace_constant {
  color: #6C99BB
}

.ace_editor .ace_invalid {
  color: #FFFFFF;
  background-color: #FF0000
}

.ace_editor .ace_fold {
  background-color: #CC7833;
  border-color: #FFFFFF
}

.ace_editor .ace_support.ace_function {
  color: #B83426
}

.ace_editor .ace_variable.ace_parameter {
  font-style: italic
}

.ace_editor .ace_string {
  color: #A5C261
}

.ace_editor .ace_string.ace_regexp {
  color: #CCCC33
}

.ace_editor .ace_comment {
  font-style: italic;
  color: #BC9458
}

.ace_editor .ace_meta.ace_tag {
  color: #FFE5BB
}

.ace_editor .ace_entity.ace_name {
  color: #FFC66D
}

.ace_editor .ace_collab.ace_user1 {
  color: #323232;
  background-color: #FFF980
}

.ace_editor .ace_indent-guide {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMwMjLyZYiPj/8PAAreAwAI1+g0AAAAAElFTkSuQmCC) right repeat-y
}

/* views */
.ace_editor span {
  display: inline;
}
.ace_editor div {
  display: block;
}
.ace_line {
  line-height: 22px;
}
.ace_editor {
  color: #999999;
  background-color: #282828 !important;
  font-family: Roboto Mono, monospace;
  font-weight: 300;
  font-size: 13px;
  line-height: 22px;
}
.ace_editor .ace_gutter {
  background-color: transparent !important;
  color: #4e4d4d !important;
}
.ace_editor .ace_marker-layer .ace_active-line {
  background: rgba(53,54,55,0.5) !important;
}
.ace_editor .ace_fold {
  background-color: transparent;
  border: 0;
  display: inline-block;
  height: 16px;
  margin-left: 5px;
}
.ace_editor .ace_gutter-cell span {
  display: inline-block;
}
.ace_editor .ace_views-block-selected {
  border-left: 3px solid #fc2d82;
  position: absolute;
  z-index: 20;
}
.ace_editor .ace_views-block-selected-rest {
  opacity: 0.5;
  background-color: #282828;
}
.ace_editor .ace_search {
  border: 0 !important;
  border-radius: 2px !important;
  background-color: #ffffff !important;
  display: flex;
  flex-direction: column;
}
.ace_editor .ace_search_form, .ace_editor .ace_replace_form {
  align-items: center;
  border: 0 !important;
  display: flex;
  flex-direction: row;
}
.ace_editor .ace_search_form.ace_nomatch {
  outline: 0 !important;
}
.ace_editor .ace_search_form.ace_nomatch .ace_search_field {
  background-color: rgba(255,0,0,0.15)
}
.ace_editor .ace_searchbtn_close {
  position: absolute;
  left: 1px;
  top: 10px;
  z-index: 10;
}
.ace_editor .ace_search_field {
  border-radius: 2px !important;
  font-family: 'Roboto Mono', monospace;
  font-weight: 300;
  padding: 10px 10px;
  margin-left: 20px;
  height: auto;
}
.ace_editor .ace_searchbtn, .ace_editor .ace_replacebtn {
  border-left: 0 !important;
  justify-content: center;
  font-weight: 300;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  padding: 5px;
  text-transform: uppercase;
  color: #323232;
}
.ace_editor .ace_searchbtn:hover, .ace_editor .ace_replacebtn:hover {
  color: black;
}
.ace_editor .ace_search_options {
  display: none !important;
}
.ace_editor .ace_error {
  background-color: #d96d6d;
  color: #fff;
  cursor: pointer;
  background-image: none;
}
.ace_editor .ace_tooltip {
  font-size: 11px;
  padding-right: 10px;
  padding-bottom: 5px;
  padding-top: 5px;
  padding-left: 10px;
  background-color: #dedfd0;
  color: #414042;
  background-image: none;
  border: 0;
}

.ace_selection {
  border-radius: 0 !important;
}

.editor-view .ace_prop.ace_value {
  color: #1fcc69;
}
.editor-view .ace_block.ace_is,
.editor-props .ace_block.ace_is,
.editor-view .ace_prop {
  color: #BCBEC0;
}
.editor-props .ace_prop {
  color: #00AEEF;
}
.editor-props .ace_prop.ace_value {
  color: #BCBEC0;
}
.editor-view .ace_value.ace_blockName,
.editor-props .ace_value.ace_blockName {
  color: #ff8300;
}
.editor-view .ace_block.ace_name,
.editor-view .ace_block.ace_name_is,
.editor-props .ace_block.ace_name,
.editor-props .ace_block.ace_name_is,
.editor-view .ace_block.ace_type,
.editor-props .ace_block.ace_type {
  color: #F29857;
}
.editor-props .ace_type.ace_empty {
  color: #595959;
}
.editor-view .ace_comment,
.editor-props .ace_comment {
  background-color: rgba(125, 177, 185, 0.7);
  background-clip: border-box;
  border: 1px solid transparent;
  border-bottom-width: 2px;
  color: #000000;
  font-style: normal;
}
.editor-view .ace_comment.ace_todo,
.editor-props .ace_comment.ace_todo {
  background-color: rgba(251, 176, 64, 0.7);
}
.editor-view .ace_indent-guide,
.editor-props .ace_indent-guide {
  opacity: 0.5;
}
.editor-view .ace_prop.ace_value.ace_code {
  color: #00AEEF;
}
.ace_prop.ace_value.ace_code.ace_list,
.ace_prop.ace_value.ace_code.ace_item,
.editor-props .ace_prop.ace_key.ace_section {
  color: #00EFE3;
}
.ace_warning {
  color: #EE4C8F;
  margin-left: 7px;
  display: inline-block;
}
.ace_parents {
  color: #595959;
  margin-left: 7px;
  display: inline-block;
}
.editor-view .ace_margin ~ .ace_prop.ace_value {
  color: #8F4BF2;
}
.editor-view .ace_padding ~ .ace_prop.ace_value {
  color: #ffce00;
}
.color-picker .sketch-picker {
  background: #282828 !important;
  background-color: #282828 !important;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 38px 2px !important;
}
.color-picker .flexbox-fix {
  display: flex;
  border-top: 0 !important;
  padding-top: 4px;
  flex-direction: row;
  font-family: Roboto Mono, monospace;
  font-weight: 300;
}
.color-picker .flexbox-fix:nth-child(4) div div {
  border: 1px solid #414042;
  box-shadow: none !important;
}
.color-picker span {
  color: #6D6E71 !important;
}
.color-picker input {
  font-family: Roboto Mono, monospace;
  font-weight: 300;
  text-align: center;
  width: 100% !important;
  background: transparent;
  color: #A1A3A6;
  border: 0;
  border-bottom: 1px solid #6D6E71 !important;
  box-shadow: none !important;
}
  /* start default autocomplete */
  .ace_editor.ace_autocomplete .ace_marker-layer .ace_active-line {
      background-color: #CAD6FA;
      z-index: 1;
  }
  .ace_editor.ace_autocomplete .ace_line-hover {
      border: 1px solid #abbffe;
      margin-top: -1px;
      background: rgba(233,233,253,0.4);
  }
  .ace_editor.ace_autocomplete .ace_line-hover {
      position: absolute;
      z-index: 2;
  }
  .ace_editor.ace_autocomplete .ace_scroller {
    background: none;
    border: none;
    box-shadow: none;
  }
  .ace_rightAlignedText {
      color: gray;
      display: inline-block;
      position: absolute;
      right: 4px;
      text-align: right;
      z-index: -1;
  }
  .ace_editor.ace_autocomplete .ace_completion-highlight{
      color: #000;
      text-shadow: 0 0 0.01em;
  }
  .ace_editor.ace_autocomplete {
      width: 280px;
      z-index: 200000;
      background: #fbfbfb;
      color: #444;
      border: 1px lightgray solid;
      position: fixed;
      box-shadow: 2px 3px 5px rgba(0,0,0,.2);
      line-height: 1.4;
  }
  /* end default autocomplete */

.ace_editor.ace_autocomplete {
  background: #3b3b3b !important;
  border: 0 !important;
  box-shadow: 0 !important;
  color: #f2f2f2 !important;
}
.ace_editor.ace_autocomplete .ace_rightAlignedText {
  color: #e8e4e4 !important;
}
.ace_editor.ace_autocomplete .ace_line {
  padding-top: 5px;
}
.ace_editor.ace_autocomplete .ace_active-line,
.ace_editor.ace_autocomplete .ace_line-hover {
  border: 0 !important;
  background-color: #ed8225 !important;
}
.ace_editor.ace_autocomplete .ace_completion-highlight {
  color: #f2f2f2 !important;
}
${CURSORS}`
