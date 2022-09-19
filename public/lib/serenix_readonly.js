/* 
 * The MIT License
 *
 * Copyright 2021 Marc KAMGA Olivier <kamga_marco@yahoo.com;mkamga.olivier@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

if (typeof $addEvt === 'undefined') {
    /**
     * 
     * @param {String} ev  The event to observe
     * @param {Element} el The element to observe event on
     * @param {Function} func  The callback function to bind to the event
     * @returns {Boolean}
     */
    function $addEvt(ev, el, func) {
        try {
            ev = ev.toLowerCase();
            if( el.addEventListener ){
                el.addEventListener( ev.startsWith('on') ? ev.substring(2) : ev, func, false );
            } else if( el.attachEvent ){
                el.attachEvent( ev.startsWith('on') ? ev : "on" + ev, func );
            }
            // Browser don't support W3C or MSFT model, go on with traditional
            else {
                if (typeof func !== 'function' && !(func instanceof Function)) {
                    throw new Error("Incorrect callback function");
                }
                if (!ev.startsWith('on'))
                    ev = 'on'+ev;
                var f, lsnrs = el[ev+"Listeners"];
                if (!lsnrs) {
                    el[ev+"Listeners"] = lsnrs = [];
                    if(typeof (f = el[ev]) === 'function'){
                        lsnrs[lsnrs.length] = f;  
                    }
                    function fire(event) {                            
                        event = event||window.event;
                        var lsnrs = el[fire.on + "Listeners"];
                        for (var i = 0, n = lsnrs.length; i < n; i++) {
                            lsnrs[i].call(this, event);
                        }
                    };
                    fire.on = ev;
                    el[ev] = fire;
                }
                if (lsnrs.indexOf(func) < 0) {
                    lsnrs[lsnrs.length] = func;
                }
            }
            return true;
        }catch( e ){
            return false;
        }   
    }
    
    function $removeEvt(ev, el, callback){
        ev = ev.toLowerCase();
        if (el.removeEventListener){
            el.removeEventListener(ev, callback, false);
        } else if (el.detachEvent) {
            el.detachEvent(ev.startsWith("on") ? ev : "on" + ev, callback);
        } else {
            if (!ev.startsWith('on'))
                ev = 'on'+ev;
            var lsnrs;
            if ((lsnrs = el[ev+"Listeners"])) {
                var i = lsnrs.indexOf(callback);
                if (i >= 0) {
                    lsnrs.splice(i, 1);
                }
            } else if (el[ev] === callback) {
                el[ev] = undefined;
            }
        }
        return true;
    }

}


;(function(g, undefined) {
    //The list of types that need patch to become to support read-only
    var patchables = ["checkbox", "range", "radio", "select-one", "select-multiple"];
    //The list of node tags supported by readonly function
    //input is partially natived supported: not working or input types 
    //"checkbox", "range" and  "radio"
    var acceptedTags = ["input", "select", "textarea"];
    /**
     * Returns true if the given element natively supports 'readOnly' property
     * @private
     * @param {Element} el
     * @returns {Boolean}
     */
    function supportsReadOnly(el) {
      return "readOnly" in el && patchables.indexOf(el.type) < 0 && 'select' !== (el.nodeName||el.tagName).toLowerCase();
    };
    /**
     * Adds 'readOnly' property to input or select element that needs patch to 
     * make readonly works well.
     * @private
     * @param {Element} el
     */
    function addProp(el) {
        if (!("readOnly" in el && (patchables.indexOf(el.type) < 0 && 'select' !== (el.nodeName||el.tagName).toLowerCase()))) {
            Object.defineProperty(el, 'readOnly', {
                get: function() {
                    return !!this.__readOnly__;
                },
                set: function(value) {
                    readonly(this, value);
                },
                configurable: true,
                enumerable: true
            });
        }
    }

    function bindCancel(el) {
        
        function cancelChange(ev) {
            ev = ev||window.event;
            var tag = (el.tagName||el.nodeName).toLowerCase();
            if (tag === 'input') {
                switch (el.type) {
                    case 'radio':
                        this.checked = cancelChange.checked;
                        if (el.sync) el.sync(el);
                        break;
                    case 'range':
                        el.value = el.__value__;
                        break;
                    case 'checkbox':
                        el.checked = el.__checked__;
                        break;
                }
            } else {
                this.value = cancelChange.value;
            }
            if (ev.preventDefault) ev.preventDefault();
            if (ev.stopPropagation) ev.stopPropagation();
        }
        cancelChange.el = el;
        cancelChange.value = el.value;
        el.cancelChange = cancelChange;
        if ((el.tagName||el.nodeName).toLowerCase() === 'input' && el.type === 'radio') {
            cancelChange.checked = el.checked;
        }
        $addEvt("change", el, el.cancelChange);
        var tag = (el.tagName||el.nodeName).toLowerCase();
        if (tag === 'input') {
            var type = el.type;
            if (type === 'radio') {
                var group = el.name, elts, gr;
                if (group) {
                    if (gr = el.group) {
                        gr.checked[gr.members.indexOf(el)] = el.checked;
                    } else  {
                        gr = {
                            name: group, 
                            members : elts = Array.prototype.slice.call(document.querySelectorAll('[name="' + group + '"]')), 
                            checked : []
                        };
                        function sync(el) {
                            var grp = el.group, 
                                members = grp.members,
                                checked = grp.checked;
                            if (el.cancelChange) {
                                for (var i = 0, n = members.length; i < n; i++) {
                                    members[i].checked = checked[i];
                                }
                            } else {                        
                                for (var i = 0, n = members.length; i < n; i++) {
                                    members[i].checked = checked[i] = members[i] === el;
                                }
                            }
                        }
                        elts.forEach(function(el) {
                            gr.checked.push(el.checked);
                            el.group = gr;
                            el.sync = sync;
                        });
                    }
                }
            } else if (type === 'checkbox') {
                el.__checked__ = el.checked;
            } else if (type === 'range') {
                el.__value__ = el.value;
            }
        }
    };

    function unbindCancel(el) {
        $removeEvt("change", el, el.cancelChange);
        delete el.cancelChange;
    };

    function setReadOnly(el) {
        /*if (el.hasAttribute("readonly")) {
            return;
        }*/
        //if natively supports 'readOnly' property
        if (supportsReadOnly(el)) {
            el.readOnly = true;
            return;
        }

        if (!el.parentElement) {
          throw Error(
            "[serenix_readonly.js]: control needs a surrogate but has not been inserted into a dom tree yet, i.e. has no parent element"
          );
        }

        el.setAttribute("readonly", "");

        bindCancel(el);
        if (el.__readOnly__ === undefined) {
            addProp(el);
        }
        el.__readOnly__ = true;
    };

    function unsetReadOnly(el) {
        if (supportsReadOnly(el)) {
            el.readOnly = false;
            return;
        }

        if (!el.parentElement) {
            throw Error(
                "[serenix_readonly.js]: control needs a surrogate but has not been inserted into a dom tree yet, i.e. has no parent element"
            );
        }

        el.removeAttribute("disabled");
        el.removeAttribute("readonly");

        unbindCancel(el);
        if (el.__readOnly__ === undefined) {
            addProp(el);
        }
        el.__readOnly__ = false;
    }
    /**
     * 
     * @param {Element} el
     * @param {Boolean} value
     */
    function _readOnly(el, value) {
        if (value === undefined) {
            value = !el.hasAttribute("readonly");
        }

        if (value) {
            setReadOnly(el);
        } else {
            unsetReadOnly(el);
        }
    }
    /**
     * Makes the given element or elements non-editable or editable if the value
     * of the second argument is true or otherwise, makes it or them editable.
     * @param {HTMLElement|String|NodeList} toSet  Element or elements to set 
     *      the value of read-only 'property' and make non-editable or editable.
     * @private
     * @param {Boolean} value
     */
    function readonly(toSet, value){
        if (arguments.length === 1) {
            value = true;
        }
        if (typeof toSet === "string") {
            toSet = document.querySelectorAll(toSet);
        } else if (toSet instanceof HTMLElement) {
            toSet = [toSet];
        } else if (toSet instanceof NodeList) {
            toSet = [].slice.call(toSet);
        } else if (!toSet || !("forEach" in toSet)) {
            throw Error("[serenix_readonly.js]: invalid argument");
        }

        toSet.forEach(function (el) {
            if (acceptedTags.indexOf((el.tagName||el.nodeName).toLowerCase()) < 0) {
                throw Error("[serenix_readonly.js]: element " + (el.tagName||el.nodeName) + " is not allowed");
            }
            _readOnly(el, value);
        });
    };
    readonly.nativeSupportsReadOnly = supportsReadOnly;
    
    function toggleReadonly(el) {
        readonly(el, readonly.nativeSupportsReadOnly(el) ? !el.readOnly : !el.__readOnly__);
    }

    if (g.jQuery) {
        g.jQuery.fn.readonly = function(value) {
            return this.each(function (_, el) {
              readonly(el, value);
            });
        };
        g.jQuery.fn.toggleReadonly = function() {
            return this.each(function (_, el) {
              toggleReadonly(el);
            });
        };
    }
    /**
     * Makes the given element or elements read-only (non-editable) if the 
     * given value is true or makes it or them editables if the value is false.
     * <p>If jQuery installed, readonly is automatically added to jQuery.</p>
     * @param {HTMLElement|String|Array|NodeList} toSet  Element or elements to set the value of rea-only 'property'.
     * @param {Boolean} value  True to set non-editable or false to set editable
     * @function
     */
    g.readonly = readonly;
    /**
     * 
     * <p>If jQuery installed, readonly is automatically added to jQuery.</p>
     */
    g.toggleReadonly = toggleReadonly;
})(this);