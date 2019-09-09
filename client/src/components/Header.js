import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Header extends Component {
  renderContent() {
    switch (this.props.auth) {
      case null:
        return;
      case false:
        return (
          <li>
            <a href="/auth/google"> Login with Google</a>
          </li>
        );
      default:
        return [
          <li key="1">
            <a href="/dashboard">Dashboard</a>
          </li>,
          <li key="2">
            <a href="/api/logout">Logout</a>
          </li>
        ];
    }
  }

  render() {
    return (
      <nav className="blue-grey">
        <div className="nav-wrapper">
          <Link
            to={this.props.auth ? '/' : '/'}
            style={{ margin: '0 10px' }}
            className="left brand-logo"
          >
            Hexxagon
          </Link>
          <ul className="right">{this.renderContent()}</ul>
        </div>
      </nav>
    );
  }
}

function mapStateToProps(state) {
  return { auth: state.auth };
}

export default connect(mapStateToProps)(Header);
