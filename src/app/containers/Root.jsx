import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Masthead from '../containers/masthead/Masthead';
import ProgressBar from '../../shared/components/progress-bar/progress-bar';
import ManageAttributes from './ManageAttributes';
import ManageCompetencies from './ManageCompetencies';
import CompetencyDetails from './CompetencyDetails';
import Competencies from './CompetencyList';
import ResourceEdit from './ResourceEdit';
import ResourceCreate from './ResourceCreate';
import ResourceDetails from './ResourceDetails';
import ResourcesList from './ResourcesList';
import ChangePassword from './ChangePassword';
import Frameworks from './Frameworks';

import { login, logout } from '../services/auth/auth';
import ActiveRequestsService from '../services/active-requests/active-requests';

const $ = window.$;

class Root extends Component {
  state = {
    isActive: false,
    roles: localStorage.getItem('roles') || '',
    user: localStorage.getItem('user') || ''
  };

  constructor(props) {
    super(props);
    this.activeRequests = new ActiveRequestsService();
  }

  componentWillMount() {
    this.subcription = this.activeRequests.addEventListener(
      this.handleActiveRequests
    );
  }

  componentDidMount() {
    $(document).foundation();
    $(document).foundationExtendEBI();
  }

  componentWillUnmount() {
    if (this.subcription) {
      this.activeRequests.removeEventListener(this.subcription);
    }
  }

  handleActiveRequests = hasPendingRequests =>
    this.setState({ isActive: hasPendingRequests });

  handleLogin = (username, password) => {
    login(username, password)
      .then(() => {
        this.setState({
          roles: localStorage.getItem('roles'),
          user: localStorage.getItem('user')
        });
      })
      .catch(error => {
        window.console.error(error);
        if (error instanceof Response) {
          switch (error.status) {
            case 400:
              error.json().then(data => window.alert(data.message));
              return;
            default:
          }
        }
        window.alert(
          'Sorry, there was an unknown login problem, please try again.'
        );
      });
  };

  handleLogout = () => {
    this.setState({ user: '', roles: '' });
    logout();
  };

  render() {
    const { isActive, roles, user } = this.state;
    return (
      <>
        <Masthead
          roles={roles}
          user={user}
          onLogin={this.handleLogin}
          onLogout={this.handleLogout}
        />
        <ProgressBar isActive={isActive} />

        <section id="main-content-area" className="row" role="main">
          <main className="column">
            <Switch>
              <ProtectedRoute
                condition={!!user && roles.includes('content_manager')}
                path="/training-resource/edit/:nid"
                component={ResourceEdit}
              />
              <ProtectedRoute
                condition={!!user && roles.includes('content_manager')}
                path="/training-resource/create"
                component={ResourceCreate}
              />
              <Route
                condition={!!user && roles.includes('framework_manager')}
                path="/training-resources/:id"
                component={ResourceDetails}
              />
              <Route path="/all-training-resources" component={ResourcesList} />
              <ProtectedRoute
                condition={!!user && roles.includes('framework_manager')}
                path="/framework/:framework/manage/competencies/:cid/manage-attributes"
                component={ManageAttributes}
              />
              <ProtectedRoute
                condition={!!user && roles.includes('framework_manager')}
                path="/framework/:framework/manage/competencies/:cid?"
                component={ManageCompetencies}
              />
              <ProtectedRoute
                condition={!!user && roles.includes('framework_manager')}
                path="/framework/:framework/competency/details/:cid"
                component={CompetencyDetails}
              />
              <Route path="/framework/:framework" component={Competencies} />
              <Route path="/user/change/password" component={ChangePassword} />
              <Route path="/" component={Frameworks} />
            </Switch>
          </main>
        </section>
      </>
    );
  }
}

export default Root;

class ProtectedRoute extends Component {
  render() {
    const { component: Component, condition, ...props } = this.props;
    return (
      <Route
        {...props}
        render={props =>
          condition ? <Component {...props} /> : <Redirect to="/" />
        }
      />
    );
  }
}
