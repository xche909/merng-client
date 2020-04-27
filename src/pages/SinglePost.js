import React, { useContext, useState } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useForm } from "../util/hooks";

import moment from "moment";

import {
  Image,
  Grid,
  Card,
  Button,
  Icon,
  Label,
  Form,
  Comment,
  Header,
  Confirm,
  Popup
} from "semantic-ui-react";

import { AuthContext } from "../context/auth";
import LikeButton from "../components/LikeButton";
import DeleteButton from "../components/DeleteButton";

const SinglePost = props => {
  const postId = props.match.params.postId;
  const { user } = useContext(AuthContext);
  const [errors, setErrors] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [commentId, setCommentId] = useState(null);
  const { data: { getPost } = {} } = useQuery(FETCH_POST_QUERY, {
    variables: { postId }
  });
  const { values, onSubmit, onChange } = useForm(handleSubmit, { comment: "" });

  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    variables: { body: values.comment, postId: postId },
    onError(err) {
      console.log(err);
      setErrors(err.graphQLErrors[0].extensions.exception.errors.body);
    },
    update() {
      setErrors(null);
    }
  });

  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    variables: { postId, commentId },
    update() {
      setCommentId(null);
      setConfirmOpen(false);
    },
    onError(err) {
      console.log(err);
    }
  });

  function handleDelete() {
    deleteComment();
  }

  const deletePostCallback = () => {
    props.history.push("/");
  };
  function handleSubmit() {
    if (user) {
      createComment();
      values.comment = "";
    } else {
      props.history.push("/login");
    }
  }
  let postMarkup;
  if (!getPost) {
    postMarkup = <p>Loading post...</p>;
  } else {
    const {
      id,
      body,
      createdAt,
      username,
      comments,
      likes,
      likeCount,
      commentCount
    } = getPost;

    postMarkup = (
      <Grid>
        <Grid.Row>
          <Grid.Column width={2}>
            <Image
              float="right"
              size="small"
              src="https://react.semantic-ui.com/images/avatar/large/molly.png"
            />
          </Grid.Column>
          <Grid.Column width={10}>
            <Card fluid>
              <Card.Content>
                <Card.Header>{username}</Card.Header>
                <Card.Meta>{moment(createdAt).fromNow()}</Card.Meta>
                <Card.Description>{body}</Card.Description>
              </Card.Content>
              <hr />
              <Card.Content extra>
                <LikeButton user={user} post={{ id, likeCount, likes }} />
                <Popup
                  inverted
                  content="Write a comment down below in the text area"
                  trigger={
                    <Button as="div" labelPosition="right">
                      <Button basic color="blue">
                        <Icon name="comments" />
                      </Button>
                      <Label basic color="blue" pointing="left">
                        {commentCount}
                      </Label>
                    </Button>
                  }
                />
                {user && user.username === username && (
                  <DeleteButton postId={id} callback={deletePostCallback} />
                )}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={1}></Grid.Column>
          <Grid.Column width={11}>
            <Comment.Group>
              <Header as="h3" dividing>
                Comments
              </Header>

              {comments.map(c => {
                return (
                  <Comment key={c.id} fluid>
                    <Comment.Avatar src="https://react.semantic-ui.com/images/avatar/large/molly.png" />
                    <Comment.Content>
                      <Comment.Author as="a">{c.username}</Comment.Author>
                      <Comment.Metadata>
                        <div>{moment(c.createdAt).fromNow()}</div>
                      </Comment.Metadata>
                      <Comment.Text>{c.body}</Comment.Text>
                      {user && c.username === user.username && (
                        <Comment.Actions
                          onClick={() => {
                            setConfirmOpen(true);
                            setCommentId(c.id);
                          }}
                        >
                          <Comment.Action>Delete</Comment.Action>
                        </Comment.Actions>
                      )}
                    </Comment.Content>
                  </Comment>
                );
              })}

              <Form reply onSubmit={onSubmit}>
                <Form.TextArea
                  name="comment"
                  style={{
                    resize: "none",
                    caretColor: "red",
                    fontSize: 15
                  }}
                  onChange={onChange}
                  value={values.comment}
                  error={errors}
                />
                <Button
                  content="Add Comment"
                  labelPosition="left"
                  icon="edit"
                  primary
                />
              </Form>
            </Comment.Group>
          </Grid.Column>
        </Grid.Row>
        <Confirm
          open={confirmOpen}
          onCancel={() => {
            setConfirmOpen(false);
          }}
          content="Are you sure to delete this comment?"
          cancelButton="NO"
          confirmButton="YES"
          onConfirm={handleDelete}
        />
      </Grid>
    );
  }
  return postMarkup;
};

const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      createdAt
      username
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

const CREATE_COMMENT_MUTATION = gql`
  mutation createComment($body: String!, $postId: ID!) {
    createComment(body: $body, postId: $postId) {
      id
      body
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`;

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      body
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`;

export default SinglePost;
