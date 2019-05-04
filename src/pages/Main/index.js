import moment from 'moment';
import React, { Component } from 'react';
import api from '../../services/api';
import logo from '../../assets/logo.png';

import { Container, Form } from './styles';

import CompareList from '../../components/CompareList';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryInput: '',
    repositoryError: false,
    repositories: [],
  };

  componentWillMount() {
    const repositories = localStorage.getItem('gitRepositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  handleAddRepository = async (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const { repositoryInput, repositories } = this.state;

    try {
      const repository = await this.getRepositoryFromGit(repositoryInput);

      this.setState({
        repositoryInput: '',
        repositories: [...repositories, repository],
        repositoryError: false,
      });

      this.updateLocalStorage([...repositories, repository]);
    } catch (error) {
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDeleteRepository = async (repositoryId) => {
    const { repositories } = this.state;
    const filtredRepositories = repositories.filter(repository => repository.id !== repositoryId);

    this.setState({ repositories: filtredRepositories });
    this.updateLocalStorage(filtredRepositories);
  };

  handleUpdateRepository = async (repositoryId) => {
    let { repositories } = this.state;
    const findRepository = repositories.find(repository => repository.id === repositoryId);

    if (findRepository) {
      const repository = await this.getRepositoryFromGit(findRepository.full_name);
      repositories = repositories.map(repo => (repo.id === repository.id ? repository : repo));

      this.setState({ repositories });
      this.updateLocalStorage(repositories);
    }
  };

  getRepositoryFromGit = async (input) => {
    const { data: repository } = await api.get(`repos/${input}`);
    repository.lastCommit = moment(repository.pushed_at).fromNow();
    return repository;
  };

  updateLocalStorage = (repositories) => {
    localStorage.setItem('gitRepositories', JSON.stringify(repositories));
  };

  render() {
    const {
      repositories, repositoryInput, repositoryError, loading,
    } = this.state;

    return (
      <Container>
        <img src={logo} alt="Github Compare" />

        <Form withError={repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            placeholder="usuário/repositório"
            value={repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {loading ? <i className="fa fa-spinner fa-pulser" /> : 'OK'}
          </button>
        </Form>
        <CompareList
          repositories={repositories}
          deleteRepository={this.handleDeleteRepository}
          updateRepository={this.handleUpdateRepository}
        />
      </Container>
    );
  }
}
