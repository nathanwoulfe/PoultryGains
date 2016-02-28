/*global angular,console,NLForm*/

/**
 * @ngdoc function
 * @name poultryGainsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the poultryGainsApp
 */
angular.module('poultryGainsApp')
  .controller('MainCtrl', function ($scope, Data) {
    'use strict';
  
    // NL form
    var document = window.document,
      nlform;

    if (!String.prototype.trim) {
      String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
      };
    }

    function NLField(form, el, type, idx) {
      this.form = form;
      this.elOriginal = el;
      this.pos = idx;
      this.type = type;
      this.create();
      this.initEvents();
    }

    NLField.prototype = {
      create : function () {
        if (this.type === 'dropdown') {
          this.createDropDown();
        } else if (this.type === 'input') {
          this.createInput();
        }
      },
      createDropDown : function () {
        var self = this,
          ihtml = '';
        
        this.fld = document.createElement('div');
        this.fld.className = 'nl-field nl-dd';
        this.toggle = document.createElement('a');
        this.toggle.innerHTML = this.elOriginal.options[this.elOriginal.selectedIndex].innerHTML;
        this.toggle.className = 'nl-field-toggle';
        this.optionsList = document.createElement('ul');
        
        Array.prototype.slice.call(this.elOriginal.querySelectorAll('option')).forEach(function (el, i) {
          ihtml += self.elOriginal.selectedIndex === i ? '<li class="nl-dd-checked">' + el.innerHTML + '</li>' : '<li>' + el.innerHTML + '</li>';
          // selected index value
          if (self.elOriginal.selectedIndex === i) {
            self.selectedIdx = i;
          }
        });
        this.optionsList.innerHTML = ihtml;
        this.fld.appendChild(this.toggle);
        this.fld.appendChild(this.optionsList);
        this.elOriginal.parentNode.insertBefore(this.fld, this.elOriginal);
        this.elOriginal.style.display = 'none';
      },
      createInput : function () {
        var self = this;
        this.fld = document.createElement('div');
        this.fld.className = 'nl-field nl-ti-text';
        this.toggle = document.createElement('a');
        this.toggle.innerHTML = this.elOriginal.getAttribute('value') || this.elOriginal.getAttribute('placeholder');
        this.toggle.className = 'nl-field-toggle';
        this.optionsList = document.createElement('ul');
        this.getinput = document.createElement('input');
        this.getinput.setAttribute('type', this.elOriginal.getAttribute('type') || '');
        this.getinput.setAttribute('placeholder', this.elOriginal.getAttribute('placeholder'));
        this.getinput.setAttribute('value', this.elOriginal.getAttribute('value') || '');
        this.getinputWrapper = document.createElement('li');
        this.getinputWrapper.className = 'nl-ti-input';
        this.inputsubmit = document.createElement('button');
        this.inputsubmit.className = 'nl-field-go';
        this.inputsubmit.innerHTML = 'Go';
        this.getinputWrapper.appendChild(this.getinput);
        this.getinputWrapper.appendChild(this.inputsubmit);
        this.example = document.createElement('li');
        this.example.className = 'nl-ti-example';
        this.example.innerHTML = this.elOriginal.getAttribute('data-subline');
        this.optionsList.appendChild(this.getinputWrapper);
        this.optionsList.appendChild(this.example);
        this.fld.appendChild(this.toggle);
        this.fld.appendChild(this.optionsList);
        this.elOriginal.parentNode.insertBefore(this.fld, this.elOriginal);
        this.elOriginal.style.display = 'none';
      },
      initEvents : function () {
        var self = this,
          opts;
        
        this.toggle.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          self._open();
        });
        this.toggle.addEventListener('touchstart', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          self._open();
        });

        if (this.type === 'dropdown') {
          opts = Array.prototype.slice.call(this.optionsList.querySelectorAll('li'));
          opts.forEach(function (el, i) {
            el.addEventListener('click', function (ev) {
              ev.preventDefault();
              self.close(el, opts.indexOf(el));
            });
            el.addEventListener('touchstart', function (ev) {
              ev.preventDefault();
              self.close(el, opts.indexOf(el));
            });
          });
        } else if (this.type === 'input') {
          this.getinput.addEventListener('keydown', function (ev) {
            if (ev.keyCode === 13) {
              self.close();
            }
          });
          this.inputsubmit.addEventListener('click', function (ev) {
            ev.preventDefault();
            self.close();
          });
          this.inputsubmit.addEventListener('touchstart', function (ev) {
            ev.preventDefault();
            self.close();
          });
        }
      },
      _open : function () {
        if (this.open) {
          return false;
        }
        this.open = true;
        this.form.fldOpen = this.pos;
        var self = this;
        this.fld.className += ' nl-field-open';
      },
      close : function (opt, idx) {
        if (!this.open) {
          return false;
        }
        this.open = false;
        this.form.fldOpen = -1;
        this.fld.className = this.fld.className.replace(/\b nl-field-open\b/, '');

        if (this.type === 'dropdown') {
          if (opt) {
            // remove class nl-dd-checked from previous option
            var selectedopt = this.optionsList.children[this.selectedIdx];
            selectedopt.className = '';
            opt.className = 'nl-dd-checked';
            this.toggle.innerHTML = opt.innerHTML;
            // update selected index value
            this.selectedIdx = idx;
            // update original select element´s value
            //this.elOriginal.value = this.elOriginal.children[ this.selectedIdx ].value;                  

            $scope[this.elOriginal.name] = this.elOriginal.children[this.selectedIdx].value;
          }
        } else if (this.type === 'input') {
          this.getinput.blur();
          this.toggle.innerHTML = this.getinput.value.trim() !== '' ? this.getinput.value : this.getinput.getAttribute('placeholder');
          //this.elOriginal.value = this.getinput.value;
          $scope[this.elOriginal.name] = this.getinput.value;
        }
      }
    };
  
    function NLForm(el) {
      this.el = el;
      this.overlay = this.el.querySelector('.nl-overlay');
      this.fields = [];
      this.fldOpen = -1;
      this.init();
    }

    NLForm.prototype = {
      init : function () {
        var self = this;
        Array.prototype.slice.call(this.el.querySelectorAll('select')).forEach(function (el, i) {
          self.fldOpen += 1;
          self.fields.push(new NLField(self, el, 'dropdown', self.fldOpen));
        });
        Array.prototype.slice.call(this.el.querySelectorAll('input:not([type="hidden"])')).forEach(function (el, i) {
          self.fldOpen += 1;
          self.fields.push(new NLField(self, el, 'input', self.fldOpen));
        });
        this.overlay.addEventListener('click', function (ev) {
          self.closeFlds();
        });
        this.overlay.addEventListener('touchstart', function (ev) {
          self.closeFlds();
        });
      },
      closeFlds : function () {
        if (this.fldOpen !== -1) {
          this.fields[this.fldOpen].close();
        }
      }
    };
  
    nlform = new NLForm(document.getElementById('nl-form'));
  
    //END NLForm
  
    $scope.data = [];
    $scope.base = $scope.unit === 'kg' ? '100g' : '1lb';
    var toLb = 2.2046;
  
    function init() {
      $scope.weight = 200;
      $scope.gender = 'm';
      $scope.type = 'gainz';
      $scope.unit = 'lb';
      $scope.hasSubmit = false;
    }
  
    // Need to do something with the selections...
    $scope.submit = function () {
      var multiplier = 0;
      if ($scope.gender === 'm') {
        multiplier = $scope.type === 'gainz' ? 1.5 : 0.8;
      } else {
        multiplier = $scope.type === 'gainz' ? 1.2 : 0.8;
      }
      var w = $scope.unit === 'kg' ? parseInt($scope.weight, 10) * 2.2046 : parseInt($scope.weight, 10);
	  $scope.base = $scope.unit === 'kg' ? '100g' : '1lb';
      
      $scope.intake = Math.ceil(w * multiplier);      
      $scope.hasSubmit = true;
    };  

    $scope.getTotal = function (g) {      
      if ($scope.unit === 'kg') {
        return g > 1000 ? +(g / 1000).toFixed(2) + 'kg' : g + 'g';
      } else {
        return +((g / 1000) * toLb).toFixed(2) + 'lb';
      }
    };
  
    $scope.getServes = function (d, m) {
      if ($scope.data.length) {
        m = parseInt(m, 10);
        
        if (m !== undefined && m > 0) {
          return Math.ceil(($scope.intake / parseInt(d.gsx$protein.$t, 10)) * m) + ' ' + d.gsx$servenotes.$t;
        } else if (m !== -1) {
          return Math.ceil($scope.intake / parseInt(d.gsx$protein.$t, 10));
        }
      }
    };  
  
    $scope.notes = function (n) {
      return n.length ? '(' + n + ')' : '';
    };

    $scope.proteinPer100 = function (i) {
      if ($scope.data.length) {
        var d = $scope.data[i],
          p = Math.round((d.gsx$protein.$t / d.gsx$serve.$t) * 100);
        
        if ($scope.unit === 'kg') {
          return p + 'g';
        } else {
          return Math.round((p * 10) / toLb) + 'g';
        }
      }
    };
    
    $scope.isChicken = function (item) {
      return item.gsx$ischicken.$t === 'TRUE';
    };
  
    $scope.notChicken = function (item) {
      return item.gsx$ischicken.$t !== 'TRUE';
    };  
    
    // Prime it with the data set
    // then call init to set variables
    Data.get()
      .then(function (resp) {
        $scope.data = resp.data.feed.entry;
        init();
      });       
  
  });
