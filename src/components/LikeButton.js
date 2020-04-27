import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Button, Icon, Label, Popup } from "semantic-ui-react";
import { FETCH_POSTS_QUERY } from "../util/graphql";

const LikeButton = ({ user, post: { id, likeCount, likes } }) => {
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    if (user && likes.find(like => like.username === user.username)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [likes, user]);

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    variables: { postId: id },
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_POSTS_QUERY
      });

      proxy.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: { getPosts: data.getPosts }
      });
    }
  });

  const likeButton = user ? (
    liked ? (
      <Button color="red">
        <Icon name="heart" />
      </Button>
    ) : (
      <Button basic color="red">
        <Icon name="heart" />
      </Button>
    )
  ) : (
    <Button as={Link} to="/login" basic color="red">
      <Icon name="heart" />
    </Button>
  );
  return (
    <Popup
      inverted
      content="Like/unlike the post"
      trigger={
        <Button as="div" labelPosition="right" onClick={user ? likePost : null}>
          {likeButton}
          <Label basic color="red" pointing="left">
            {likeCount}
          </Label>
        </Button>
      }
    />
  );
};

const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likeCount
      likes {
        id
        username
        createdAt
      }
    }
  }
`;

export default LikeButton;
