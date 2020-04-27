import React, { useState, useContext } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

import { Form, Button } from "semantic-ui-react";

const Register = props => {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const { onChange, onSubmit, values } = useForm(register, {
    username: "",
    password: "",
    email: "",
    confirmPassword: ""
  });

  const [addUser, { loading }] = useMutation(REGISTER_MUTATION, {
    //update function will be triggered if this mutation is successfully executed
    update(
      proxy,
      {
        data: { register: userData }
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

  function register() {
    addUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <h1>Register</h1>
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
          label="Email"
          placeholder="Email..."
          type="email"
          name="email"
          error={errors.email ? true : false}
          value={values.email}
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
        <Form.Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm password..."
          name="confirmPassword"
          error={errors.confirmPassword ? true : false}
          value={values.confirmPassword}
          onChange={onChange}
        />
        <Button type="submit" primary>
          Register
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

const REGISTER_MUTATION = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        email: $email
        username: $username
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      username
      createdAt
      token
    }
  }
`;

export default Register;
