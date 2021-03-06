﻿var log = window.console !== undefined ? window.console.log : function(){};
var TOUCH =
{
    _subscribed: false,
    _dom:
    {
        touchstart: [],
        touchend: [],
        touchmove: [],
        touchenter: [],
        touchleave: [],
        touchcancel: []
    },

    _previousElement: undefined,

    _threshold: 200,
    _previousTimespan: Date.now(),

    _equals: function (x) {
        var p;
        for (p in this) {
            if (this.hasOwnProperty(p)) {
                if (typeof (x[p]) === 'undefined') {
                    return false;
                }
            }
        }
        for (p in this) {
            if (this.hasOwnProperty(p)) {
                if (this[p]) {
                    switch (typeof (this[p])) {
                        case 'object':
                            if (this[p].equals !== undefined && !this[p].equals(x[p])) {
                                return false;
                            }
                            else if (this[p] !== x[p]) {
                                return false;
                            };
                            break;
                        case 'function':
                            if (typeof (x[p]) === 'undefined' || (p !== 'equals' && this[p].toString() !== x[p].toString())) {
                                return false;
                            };
                            break;
                        default:
                            if (this[p] !== x[p]) {
                                return false;
                            }
                    }
                }
                else {
                    if (x[p]) {
                        return false;
                    }
                }
            }
        }

        for (p in x) {
            if (x.hasOwnProperty(p)) {
                if (typeof (this[p]) === 'undefined') {
                    return false;
                }
            }
        }
        return true;
    },

    _touches: [],

    _createTouch: function (evt, type, currentTime) {
        var touch =
        {
            identifier: evt.identifier,
            clientX: evt.clientX,
            clientY: evt.clientY,
            screenX: evt.clientX + (window.outerWidth - window.innerWidth) / 2 + window.screenX,
            screenY: evt.clientY + (window.outerHeight - window.innerHeight) + window.screenY,
            //aprox, can't calculate exact value :(
            pageX: evt.clientX + window.pageXOffset,
            pageY: evt.clientY + window.pageYOffset,
            radiusX: 0,
            radiusY: 0,
            rotationAngle: 0,
            force: 0,
            type: type,
            timespan: currentTime
        };

        return touch;
    },

    _createTouchEvent: function (touches) {
        var touchEvent =
        {
            touches: touches,
            targetTouches: {},
            changedTouches: {},
            altKey: false,
            metaKey: false,
            ctrlKey: false,
            shiftKey: false,
            relatedTarget: {}
        };

        return touchEvent;
    },

    _onTouchStart: function (x, y, id) {
        var i,
        touchstart = TOUCH._dom.touchstart, currentTime = Date.now(), evt =
        {
            clientX: x,
            clientY: y,
            identifier: id
        },
        element = document.elementFromPoint(evt.clientX, evt.clientY), touch = TOUCH._createTouch(evt, 'touchstart', currentTime), touchEvent,
        touches = [];

        for (i = TOUCH._touches.length - 1; i >= 0; i--) {
            if ((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold) {
                if (TOUCH._touches[i].identifier !== touch.identifier) {
                    if (TOUCH._touches[i].type === 'touchend' || TOUCH._touches[i].type === 'touchcancel') {
                        TOUCH._touches.splice(i, 1);
                    }
                    else if (TOUCH._touches[i].type === 'touchstart') {
                        touches.push(TOUCH._touches[i]);
                    }
                    else if (TOUCH._touches[i].identifier === touch.identifier) {
                        TOUCH._touches.splice(i, 1);
                    }
                }
                else {
                    TOUCH._touches.splice(i, 1);
                }
            }
            else {
                TOUCH._touches.splice(i, 1);
            }
        }

        TOUCH._touches.push(touch);
        touches.push(touch);

        touchEvent = TOUCH._createTouchEvent(touches);

        while (element) {
            for (i = 0; i < touchstart.length; i++) {
                if (touchstart[i].domElement === element) {
                    touchstart[i].handler(touchEvent);                      
                }
            }
            element = element.parentNode;
        }
    },

    _onTouchEnd: function (x, y, id) {
        var i,
        touchend = TOUCH._dom.touchend, currentTime = Date.now(), evt =
        {
            clientX: x,
            clientY: y,
            identifier: id
        },
        element = document.elementFromPoint(evt.clientX, evt.clientY), touch = TOUCH._createTouch(evt, 'touchend', currentTime), touchEvent,
        touches = [];

        for (i = TOUCH._touches.length - 1; i >= 0; i--) {
            if ((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold) {
                if (TOUCH._touches[i].type === 'touchcancel') {
                    TOUCH._touches.splice(i, 1);
                }
                else if (TOUCH._touches[i].type === 'touchend') {
                    touches.push(TOUCH._touches[i]);
                }
            }
            else {
                TOUCH._touches.splice(i, 1);
            }
        }

        TOUCH._touches.push(touch);
        touches.push(touch);

        touchEvent = TOUCH._createTouchEvent(touches);

        while (element) {
            for (i = 0; i < touchend.length; i++) {
                if (touchend[i].domElement === element) {
                    touchend[i].handler(touchEvent);                    
                }
            }
            element = element.parentNode;
        }
    },
    _onTouchMove: function (x, y, id) {
        var i,
        j,
        touchmove = TOUCH._dom.touchmove,
        touchenter = TOUCH._dom.touchenter,
        touchleave = TOUCH._dom.touchleave,
        currentTime = Date.now(), evt =
        {
            clientX: x,
            clientY: y,
            identifier: id
        },
        element = document.elementFromPoint(evt.clientX, evt.clientY), nextElement = element,
        touch = TOUCH._createTouch(evt, 'touchmove', currentTime), touchEvent,
        touchEnter = TOUCH._createTouch(evt, 'touchenter', currentTime), touchEnterEvent,
        touchLeave = TOUCH._createTouch(evt, 'touchleave', currentTime), touchLeaveEvent,
        touches = [],
        touchesEnter = [],
        touchesLeave = [],
        previousElement,
        previousTouch,
        addedElements = [], removedElements = [], index;

        for (i = TOUCH._touches.length - 1; i >= 0; i--) {
            //we can have several events of different types but same identifier. We only want the touchmove
            if (TOUCH._touches[i].identifier === touch.identifier && TOUCH._touches[i].type === 'touchmove') {
                previousTouch = TOUCH._touches[i];
                if (previousTouch.clientX === touch.clientX && previousTouch.clientY === touch.clientY) {
                    //log('exit id:' + touch.identifier);
                    //we remove the previous event and add the new one with the updated timespan
                    TOUCH._touches.splice(i, 1);
                    TOUCH._touches.push(touch);
                    return;
                }
            }
            if ((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold) {
                if (TOUCH._touches[i].type === 'touchend' || TOUCH._touches[i].type === 'touchcancel') {
                    TOUCH._touches.splice(i, 1);
                }
                else if (TOUCH._touches[i].type === 'touchmove') {
                    touches.push(TOUCH._touches[i]);
                } else if (TOUCH._touches[i].type === 'touchenter') {
                    touchesEnter.push(TOUCH._touches[i]);
                } else if (TOUCH._touches[i].type === 'touchleave') {
                    touchesLeave.push(TOUCH._touches[i]);
                }
            }
            else {
                TOUCH._touches.splice(i, 1);
            }
        }

        TOUCH._touches.push(touch);
        touches.push(touch);

        touchEvent = TOUCH._createTouchEvent(touches);

        while (nextElement) {
            addedElements.push(nextElement);
            for (i = 0; i < touchmove.length; i++) {
                if (touchmove[i].domElement === nextElement) {
                    touchmove[i].handler(touchEvent);                    
                }
            }
            nextElement = nextElement.parentNode;
        }

        if (TOUCH._previousElement === undefined) {
            TOUCH._previousElement = element;
            return;
        } else {
            previousElement = TOUCH._previousElement;
        }

        if (previousElement !== element) {            
            while (previousElement) {
                index = addedElements.indexOf(previousElement);
                if (index !== -1) {
                    addedElements.splice(index, 1);
                }
                else {
                    removedElements.push(previousElement);
                }

                previousElement = previousElement.parentNode;
            }
            if (addedElements.length > 0) {
                touchesEnter.push(touchEnter);
                touchEnterEvent = TOUCH._createTouchEvent(touchEnter);
                for (i = 0; i < addedElements.length; i++) {
                    for (j = 0; j < touchesEnter.length; j++) {
                        if (addedElements[i] === touchenter[j].domElement) {
                            touchenter[j].handler(touchEnterEvent);
                        }
                    }
                }                
            }

            if (removedElements.length > 0) {
                touchesLeave.push(touchLeave);
                touchLeaveEvent = TOUCH._createTouchEvent(touchLeave);
                for (i = 0; i < removedElements.length; i++) {
                    for (j = 0; j < touchesLeave.length; j++) {
                        if (removedElements[i] === touchleave[j].domElement) {
                            touchleave[j].handler(touchLeaveEvent);
                        }
                    }
                }
            }
        }

        TOUCH._previousElement = element;
    },

    _isEventSupported: function (eventName, element) {
        //not in used at this moment...
        element = element || document.createElement("div");
        eventName = "on" + eventName;
        var isSupported = eventName in element;
        if (!isSupported) {
            if (!element.setAttribute) {
                element = document.createElement("div");
            }
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, "");
                isSupported = typeof element[eventName] === "function";
                element.removeAttribute(eventName);
            }
        }
        element = null;
        return isSupported;
    },   

    addEventListener: function (type, element, handler) {
        var domElement,
        elemHand,
        touch;
        if (!this._subscribed) {          
            // At this moment it supports only my activex touch control. We should add support for iOS (easy?) and Firefox (not too complicated?)
            try {
                touch = new ActiveXObject("ActiveXTouch.IETouch");

                if (touch.IsTouch()) {
                    touch.register();

                    touch.addEventListener('touchDown', TOUCH._onTouchStart);
                    touch.addEventListener('touchMove', TOUCH._onTouchMove);
                    touch.addEventListener('touchUp', TOUCH._onTouchEnd);
                    this._subscribed = true;                    
                }
                else {
                    //No touch support. Add event doesn't return errors so just return
                    return;
                }
            }
            catch (exc) {
                //No touch support. Add event doesn't return errors so just return
                return;
            }
        }

        if (this._dom[type] === undefined) {
            throw 'Event ' + type + ' is not valid';
        }

        domElement = (typeof element === "string") ? document.getElementById(element) : element;
        
        if (domElement.document === undefined) {
            throw 'Element ' + element + ' not in DOM or not a DOM element';
        }

        elemHand =
        {
            domElement: domElement,
            handler: handler,
            equals: this._equals
        };

        if (this._dom[type].indexOf(elemHand) === -1) {
            this._dom[type].push(elemHand);
        }
    },

    removeEventListener: function (type, element, handler) {
        var domElement,
        elemHand,
        i;
        domElement = document.getElementById(element);

        if (this._dom[type] === undefined) {
            throw 'Event ' + type + ' is not valid';
        }

        elemHand =
        {
            domElement: domElement,
            handler: handler,
            equals: this._equals
        };

        for (i = 0; i < this._dom[type].length; i++) {
            if (elemHand.equals(this._dom[type][i])) {
                this._dom[type].splice(i, 1);
                return;
            }
        }

        throw 'Element ' + element + ' does not have the handler you have specified';
    }
};