import React, { useState } from "react";
import { Button, Form } from "semantic-ui-react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { FETCH_POSTS_QUERY } from "../util/graphql";

import { useForm } from "../util/hooks";

const PostForm = () => {
  const [errors, setErrors] = useState(null);

  const { values, onSubmit, onChange } = useForm(createPostCallback, {
    body: ""
  });

  const [createPost] = useMutation(CREATE_POST_MUTATION, {
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY
      });
      proxy.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: { getPosts: [result.data.createPost, ...data.getPosts] }
      });
      values.body = "";
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors.body);
    },
    variables: values
  });

  function createPostCallback() {
    createPost();
  }

  return (
    <Form onSubmit={onSubmit}>
      <h2>Create a post:</h2>
      <Form.Field>
        <Form.Input
          placeholder="Hi world!"
          name="body"
          onChange={onChange}
          value={values.body}
          error={errors}
        />
        <Button tyoe="submit" color="blue">
          Submit
        </Button>
      </Form.Field>
    </Form>
  );
};

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      username
      body
      createdAt
      likeCount
      likes {
        id
        username
        createdAt
      }
      commentCount
      comments {
        id
        username
        body
        createdAt
      }
    }
  }
`;

export default PostForm;
