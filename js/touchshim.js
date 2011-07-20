//detect if browsers is touch enable


var TOUCH = {
    _subscribed: false,
    _dom: {
        touchstart: [],
        touchend: [],
        touchmove: [],
        touchenter: [],
        touchleave: [],
        touchcancel: []
    },

    _touchInterface: {},

    _threshold: 200,
    _previousTimespan: Date.now(),

    _equals: function (x) {
        for (p in this) {
            if (typeof (x[p]) == 'undefined') { return false; }
        }
        for (p in this) {
            if (this[p]) {
                switch (typeof (this[p])) {
                    case 'object':
                        if (this[p].equals !== undefined && !this[p].equals(x[p])) { return false }
                        else if (this[p] !== x[p]) { return false }; break;
                    case 'function':
                        if (typeof (x[p]) == 'undefined' || (p != 'equals' && this[p].toString() != x[p].toString())) { return false; }; break;
                    default:
                        if (this[p] != x[p]) { return false; }
                }
            }
            else {
                if (x[p]) {
                    return false;
                }
            }
        }

        for (p in x) {
            if (typeof (this[p]) == 'undefined') { return false; }
        }
        return true;
    },

    _touches: [],

    _createTouch: function (evt, currentTime) {
        var touch = {
            identifier: evt.identifier,
            clientX: evt.clientX,
            clientY: evt.clientY,
            screenX: evt.clientX + (window.outerWidth - window.innerWidth) / 2 + window.screenX,
            screenY: evt.clientY + (window.outerHeight - window.innerHeight) + window.screenY, //aprox, can't calculate exact value :(
            pageX: evt.clientX + window.pageXOffset,
            pageY: evt.clientY + window.pageYOffset,
            radiusX: 0,
            radiusY: 0,
            rotationAngle: 0,
            force: 0,
            type: 'touchstart',
            timespan: currentTime
        };

        return touch;
    },

    _createTouchEvent: function (touches) {
        var touchEvent = {
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
        var i, touchstart = TOUCH._dom['touchstart'],
            currentTime = Date.now(), evt = { clientX: x, clientY: y, identifier: id }, touch = TOUCH._createTouch(evt, currentTime),
            touchEvent, element = document.elementFromPoint(evt.clientX, evt.clientY);

        TOUCH._touches.push(touch);
        touches = [];

        for (i = TOUCH._touches.length - 1; i >= 0; i--) {
            if ((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold) {
                if (TOUCH._touches[i].type === 'touchend' || TOUCH._touches[i].type === 'cancel') {
                    TOUCH._touches.splice(i, 1);
                } else if (TOUCH._touches[i].type === 'touchstart') {
                    touches.push(TOUCH._touches[i]);
                }
            } else {
                TOUCH._touches.splice(i, 1);
            }
        };

        touchEvent = TOUCH._createTouchEvent(touches);

        while (element) {
            for (i = 0; i < touchstart.length; i++) {
                if (touchstart[i].domElement === element) {
                    touchstart[i].handler(touchEvent);
                    //do something about bubling here!    
                }
            }
            element = element.parentNode;
        }
    },

    _onTouchEnd: function (event) {
        //        var i, touchend = TOUCH._dom['touchend'],
        //            currentTime = Date.now(), touch = TOUCH._createTouch(event),
        //            touchEvent, element = document.elementFromPoint(event.clientX, event.clientY);

        //        TOUCH._touches.push(touch);
        //        touches = [];

        //        for (i = TOUCH._touches.length - 1; i >= 0; i--) {
        //            if ((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold) {
        //                if (TOUCH._touches[i].type === 'touchend' || TOUCH._touches[i].type === 'cancel') {
        //                    TOUCH._touches[i].splice(i, 1);
        //                } else if (TOUCH._touches[i].type === 'touchstart') {
        //                    touches.push(TOUCH._touches[i]);
        //                }
        //            } else {
        //                TOUCH._touches[i].splice(i, 1);
        //            }
        //        };

        //        touchEvent = TOUCH._createTouchEvent(touches);

        //        for (i = 0; i < touchend.length; i++) {
        //            touchend[i].handler(touchEvent);
        //        }
    },
    _onTouchMove: function (evt) {
        //        var i;
        //        for (i = 0; i < _touches.length; i++) {
        //            if (_touches[i].identifier === event.streamId) {
        //                _touches[i].type = 'touchmove';
        //                //recreate list?
        //                break;
        //            }
        //        }
    },

    _isEventSupported: function (eventName, element) {
        element = element || document.createElement("div");
        eventName = "on" + eventName;
        var isSupported = eventName in element;
        if (!isSupported) {
            if (!element.setAttribute) {
                element = document.createElement("div");
            }
            if (element.setAttribute && element.removeAttribute) {
                element.setAttribute(eventName, "");
                isSupported = typeof element[eventName] == "function";
                element.removeAttribute(eventName);
            }
        }
        element = null;
        return isSupported;
    },

    _getTouchEventMode: function () {
        if (this._isEventSupported('touchstart')) {
            return 'iOS';
        } else if (this._isEventSupported('moztouchdown')) {
            return 'FF';
        } else {
            // ???
        }
    },

    addEventListener: function (type, element, handler) {
        var domElement, elemHand;
        if (!this._subscribed) {
            //            if (Modernizr.touch) {
            //                //how do we detect the browser now?
            //                document.addEventListener('MozTouchDown', this._onTouchStart, false);
            //                document.addEventListener('MozTouchUp', this._onTouchEnd, false);
            //                document.addEventListener('MozTouchMove', this._onTouchMove, false);

            //                this._subscribed = true;
            //            } else {
            //                //nothing to do, addeventlistener throws no return values nor exceptions
            //            }
            // Think how to handle other browsers...

            try {
                var touch = new ActiveXObject("ActiveXTouch.IETouch");

                if (touch.IsTouch()) {
                    touch.register();

                    touch.addEventListener('touchDown', TOUCH._onTouchStart);
                    touch.addEventListener('touchMove', TOUCH._onTouchMove);
                    touch.addEventListener('touchUp', TOUCH._onTouchEnd);
                    this._subscribed = true;
                    //TODO: update subscribed!
                } else {
                    //No touch support. Add event doesn't return errors so just return
                    return;
                }
            } catch (exc) {
                //No touch support. Add event doesn't return errors so just return
                return;
            }
        }

        if (this._dom[type] === undefined) {
            throw 'Event ' + type + ' is not valid';
        }

        domElement = document.getElementById(element);
        if (domElement === undefined) {
            throw 'Element ' + element + ' not in DOM';
        }
        elemHand = {
            domElement: domElement,
            handler: handler,
            equals: this._equals
        };
        if (this._dom[type].indexOf(elemHand) === -1) {
            this._dom[type].push(elemHand);
        }
    },

    removeEventListener: function (type, element, handler) {
        var domElement, elemHand, i;
        domElement = document.getElementById(element);

        if (this._dom[type] === undefined) {
            throw 'Event ' + type + ' is not valid';
        }

        elemHand = {
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
    },

    dispatchEvent: function (event) {

    },
    detect: function () {
        try {
            document.createEvent("MozTouchDown");
            return true;
        } catch (e) {
            return false;
        }
    },

    eventFactory: function (type) {
        var constr = type, newevent;
        // error if the constructor doesn't exist
        if (typeof TOUCH[constr] !== "function") {
            throw {
                name: "Error",
                message: constr + " event doesn't exist"
            };
        }
    },

    touchstart: function () {
        var evt;
        evt = document.createEvent('Event', true, true);

    },
    touchend: function () { },
    touchmove: function () { },
    touchcancel: function () { },
    touchenter: function () { },
    touchleave: function () { },
    touchcancel: function () { }
};