// src/Home.js

import React, { Component } from 'react';
import { withAuth } from '@okta/okta-react';

class Home extends Component {


  render() {

    return (
    <div>

    </div>
    )

  }
}

export default withAuth(Home)