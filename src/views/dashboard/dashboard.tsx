import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { Loading, RichTextField, Title, useGetList, useSidebarState } from 'react-admin';
import { useEffect, useState } from 'react';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArticleIcon from '@mui/icons-material/Article';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CategoryIcon from '@mui/icons-material/Category';
import { ChessBoardView } from '../../fields/ChessBoardView';
import { YoutubeField } from '../../fields/YoutubeField';
import { appTitle } from "@mahaswami/vc-frontend";

if (!('toJSON' in Error.prototype))
   Object.defineProperty(Error.prototype, 'toJSON', {
       value: function () {
           var alt = {};
   
           Object.getOwnPropertyNames(this).forEach(function (key) {
               alt[key] = this[key];
           }, this);
   
           return alt;
       },
       configurable: true,
       writable: true
   });

 
export const Dashboard = () => {

    const [sideBarOpen, setSidebarOpen] = useSidebarState();

    useEffect(() => {
        if (sideBarOpen) {
           setSidebarOpen(false);
        }
     }, []);

   // Removed unused topicsData and topicsLoading variables


   const { data: topicsData, isLoading: topicsLoading } = useGetList('topics', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'name', order: 'ASC' },
      filter: {},
   });

   const { data: postsData, isLoading: postsLoading } = useGetList('posts', {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'title', order: 'ASC' },
      filter: {},       
   },
   // { enabled: !topicsLoading && topicsData.length > 0 }
  );

   const [topics, setTopics] = useState<{ name: string, topic_id: number, count: number }[]>([]);
   const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
   const [posts, setPosts] = useState<{ title: string, content: string, type: string }[]>([]);
   const [selectedPost, setSelectedPost] = useState<{ 
      title: string, 
      content: string, //TODO: This is no longer used. Needs to be removed
      type: string, 
      video_url: string, 
      article: string, 
      notation: string 
   } | null>(null);

   useEffect(() => {
      if (!topicsLoading && !postsLoading && topicsData && postsData) {
         const topicCounts = topicsData.map(topic => {
            const count = postsData.filter(post => post.topic_id === topic.id).length;
            return {
               name: topic.name,
               topic_id: topic.id,
               count: count,
            };
         });
         const topicsWithContent = topicCounts.filter(topic => topic.count > 0);
         setTopics(topicsWithContent);
      }
   }, [topicsLoading, postsLoading, topicsData, postsData]);


    const handleTopicClick = (topic: any) => {
       setSelectedTopic(topic);
       const filtered = postsData.filter(post => post.topic_id === topic.topic_id);
       const postsWithAttributes = filtered.map(post => ({
          title: post.title,
          content: post.content,
          type: post.type,
          video_url: post.video_url,
          article: post.article,
          notation: post.notation,
       }));
       setPosts(postsWithAttributes);
    };

    const makeVideoFullscreen = () => {
         try {
            let isAppleMobileOS = /iPad|iPhone/.test(navigator.userAgent);
            isAppleMobileOS = true
            if (isAppleMobileOS == false) {
               const video = document.getElementById('fullscreencontent') as HTMLIFrameElement;
               if (video.requestFullscreen) {
                  video.requestFullscreen();
               }         
               if (video.webkitRequestFullScreen) {
                video.webkitRequestFullScreen(); 
               }         
            } else {
                  console.log("Apple OS detected");
                  //setSidebarOpen(false);
                  let iframe = document.getElementById("iframe_content") as HTMLIFrameElement;
                  if (iframe) {
                  } else {
                      iframe = document.getElementById("fullscreencontent") as HTMLElement;                      
                  }
                  iframe.style.position = 'absolute';
                  iframe.style.top = '0';
                  iframe.style.right = '0';
                  iframe.style.bottom = '0';
                  iframe.style.left = '0';
                  iframe.style.zIndex = '9999 !important';
                  const toolbar = document.querySelector('.MuiToolbar-root') as HTMLElement;
                  if (toolbar) {
                     toolbar.style.display = 'none';
                  }
            }
      } catch (error) {
         console.error("Error in going full screen : " + JSON.stringify(error));
         alert("Error in going full screen : " + JSON.stringify(error));
      }   
    }         

    const handlePostClick = (post: any) => {
       setSelectedPost(post);
    };

    const handleBackClick = () => {
       setSelectedTopic(null);
       setPosts([]);
       setSelectedPost(null);
    };

    if (postsLoading) {
       return <Loading />;
    }

    return (
       <>
       <Title title={appTitle() + ' Dashboard'} />
       <Grid container spacing={2} style={{ padding: '6px' }}>
          <Grid item xs={12}>
             <Grid container alignItems="center" justifyContent="space-between">
                <Typography variant="h4" gutterBottom>
                    <CategoryIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {selectedPost ? selectedPost.title : selectedTopic ? `Posts for ${selectedTopic.name}` : 'Topics'}
                </Typography>
                {selectedTopic && !selectedPost && (
                    <Button variant="contained" onClick={handleBackClick}>
                       Back to Topics
                    </Button>
                )}
                {selectedPost && (
                    <>
                        <div style={{ float: 'right' }}>
                            {/* <Button variant="contained" onClick={makeVideoFullscreen}>
                                Go Fullscreen
                            </Button> */}
                            <Button variant="contained" onClick={() => setSelectedPost(null)} style={{ marginLeft: '8px' }}>
                                Back to Posts
                            </Button>
                        </div>
                    </>
                )}
             </Grid>
          </Grid>

          {selectedTopic ? (
             <>
                {selectedPost ? (
                    <Grid item xs={12}>
                       <Card style={{ height: '100vh' }}>
                          <CardContent style={{ height: '100%' }}>
                             {selectedPost.type === 'video' && (
                                <div id="fullscreencontent" style={{ height: '100%' }}>
                                    <YoutubeField source="video_url" record={selectedPost} videoWidth="100%" videoHeight="85%" />
                                </div>
                             )}
                             {selectedPost.type === 'article' && (
                                <div id="fullscreencontent" style={{ height: '100%' }}>
                                    <RichTextField source="article" record={selectedPost} />
                                </div>
                             )}
                           {(selectedPost.type === 'interactive_board' || selectedPost.type === 'game_analysis_board') && (
                              <div id="fullscreencontent" style={{ height: '100%' }}>
                               <ChessBoardView isPGN={selectedPost.type === 'game_analysis_board'} value={selectedPost.notation} height="100%" />
                             </div>
                           )}
                          </CardContent>
                       </Card>
                    </Grid>
                ) : (
                    <>
                       {posts.filter(post => post.type === 'article').length > 0 && (
                          <>
                             <Grid item xs={12}>
                                <Typography variant="h5" gutterBottom style={{ display: 'inline-block' }}>
                                    <ArticleIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Articles
                                </Typography>
                             </Grid>
                             {posts.filter(post => post.type === 'article').map(post => (
                                <Grid item xs={12} key={post.title}>
                                    <Card onClick={() => handlePostClick(post)}>
                                       <CardContent>
                                          <Typography variant="h6" style={{ display: 'inline-block' }}>{post.title}</Typography>
                                          <Typography variant="body2">{post.content}</Typography>
                                       </CardContent>
                                    </Card>
                                </Grid>
                             ))}
                          </>
                       )}

                       {posts.filter(post => post.type === 'video').length > 0 && (
                          <>
                             <Grid item xs={12}>
                                <Typography variant="h5" gutterBottom style={{ display: 'inline-block' }}>
                                    <VideoLibraryIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Videos
                                </Typography>
                             </Grid>
                             {posts.filter(post => post.type === 'video').map(post => (
                                <Grid item xs={12} key={post.title}>
                                    <Card onClick={() => handlePostClick(post)}>
                                       <CardContent>
                                          <Typography variant="h6" style={{ display: 'inline-block' }}>{post.title}</Typography>
                                          <Typography variant="body2">{post.content}</Typography>
                                       </CardContent>
                                    </Card>
                                </Grid>
                             ))}
                          </>
                       )}

                       {posts.filter(post => (post.type === 'interactive_board' || post.type === 'game_analysis_board' ) ).length > 0 && (
                          <>
                             <Grid item xs={12}>
                                <Typography variant="h5" gutterBottom style={{ display: 'inline-block' }}>
                                    <PlayCircleOutlineIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                    Explore Games and Replays
                                </Typography>
                             </Grid>
                             {posts.filter(post1 => (post1.type === 'interactive_board' || post1.type === 'game_analysis_board' )).map(post => (
                                <Grid item xs={12} key={post.title}>
                                    <Card onClick={() => handlePostClick(post)}>
                                       <CardContent>
                                          <Typography variant="h6" style={{ display: 'inline-block' }}>{post.title}</Typography>
                                          <Typography variant="body2">{post.content}</Typography>
                                       </CardContent>
                                    </Card>
                                </Grid>
                             ))}
                          </>
                       )}
                    </>
                )}
             </>
          ) : (
             topics.map(topic => (
                <Grid item xs={12} sm={6} md={4} key={topic.name}>
                    <Card 
                       onClick={() => handleTopicClick(topic)} 
                       style={{ backgroundColor: `hsl(${Math.random() * 360}, 100%, 90%)` }}
                    >
                       <CardContent>
                          <Typography variant="h6">{topic.name}</Typography>
                          <Typography variant="body2">{topic.count} posts</Typography>
                       </CardContent>
                    </Card>
                </Grid>
             ))
          )}
       </Grid>
       </>
    );
};

export default Dashboard;
