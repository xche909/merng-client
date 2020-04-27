import React, { useContext } from "react";
import { useQuery } from "@apollo/react-hooks";
import { FETCH_POSTS_QUERY } from "../util/graphql";

import { AuthContext } from "../context/auth";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";

import { Grid, Transition } from "semantic-ui-react";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { loading, error, data } = useQuery(FETCH_POSTS_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error...</p>;
  const posts = data.getPosts;

  return (
    <Grid columns={3} stackable divided>
      <Grid.Row className="page-title">
        <h1>Recent Posts</h1>
      </Grid.Row>
      <Grid.Row>
        {user && (
          <Grid.Column>
            <PostForm />
          </Grid.Column>
        )}
        {loading ? (
          <h1>Loading posts...</h1>
        ) : (
          <Transition.Group animation="jiggle">
            {posts &&
              posts.map(p => (
                <Grid.Column
                  key={p.id}
                  style={{ marginBottom: 20, boxShadow: "none" }}
                >
                  <PostCard post={p} />
                </Grid.Column>
              ))}
          </Transition.Group>
        )}
      </Grid.Row>
    </Grid>
  );
};

export default Home;
