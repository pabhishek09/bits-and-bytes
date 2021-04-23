import React from 'react';
import './style.css';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

function Feed(props: any) {

  return (
    <div className="feed-container">
      <video 
        className={"feed-content" + (props.idAttr === 'user-video' ? ' user-feed': '')} 
        id={props.idAttr} 
        autoPlay 
        playsInline
      />    
    </div>
  );
}

export default Feed;
