import React, { useState, useContext } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

import { Form, Button } from "semantic-ui-react";
const Login = props => {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const { onChange, onSubmit, values } = useForm(login, {
    username: "",
    password: ""
  });

  const [logUser, { loading }] = useMutation(LOGIN_MUTATION, {
    //update function will be triggered if this mutation is successfully executed
    update(
      proxy,
      {
        data: { login: userData }
      }
    ) {
      context.login(userData);
      props.history.push("/");
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors);
    },
    variables: values
  });

  function login() {
    logUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <h1>Login</h1>
        <Form.Input
          label="Username"
          placeholder="Username..."
          type="text"
          name="username"
          error={errors.username ? true : false}
          value={values.username}
          onChange={onChange}
        />

        <Form.Input
          label="Password"
          type="password"
          placeholder="Password..."
          name="password"
          error={errors.password ? true : false}
          value={values.password}
          onChange={onChange}
        />

        <Button type="submit" primary>
          Log In
        </Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map(val => (
              <li key={val}>{val}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const LOGIN_MUTATION = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Login;
