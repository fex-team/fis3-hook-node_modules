define('client/router.jsx', function(require, exports, module) {

  'use strict';
  
  Object.defineProperty(exports, '__esModule', {
      value: true
  });
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
  
  var _react = require('node_modules/react/react');
  
  var _react2 = _interopRequireDefault(_react);
  
  var _reactRouter = require('node_modules/react-router/lib/index');
  
  var _layoutJsx = require('client/layout.jsx');
  
  var _layoutJsx2 = _interopRequireDefault(_layoutJsx);
  
  var _routesHomeIndexJsx = require('client/routes/home/index.jsx');
  
  var _routesHomeIndexJsx2 = _interopRequireDefault(_routesHomeIndexJsx);
  
  var routes = _react2['default'].createElement(
      _reactRouter.Router,
      null,
      _react2['default'].createElement(
          _reactRouter.Route,
          { path: '/',
              component: _layoutJsx2['default'] },
          _react2['default'].createElement(_reactRouter.IndexRoute, { component: _routesHomeIndexJsx2['default'] })
      )
  );
  
  exports['default'] = routes;
  module.exports = exports['default'];

});
