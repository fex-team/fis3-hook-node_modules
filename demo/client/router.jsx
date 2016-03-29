import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'

import Layout from './layout.jsx'
import Home from './routes/home/index.jsx'
import Form from './routes/form/index.jsx'


const routes = (
    <Router>
        <Route path="/"
               component={Layout}>
            <IndexRoute component={Home}/>
          <Route path="/form" component={Form}/>
        </Route>
    </Router>
)

export default routes