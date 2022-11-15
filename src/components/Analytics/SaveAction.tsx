import React from 'react';
import { IconButton } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import domtoimage from "dom-to-image";
import fileDownload from "js-file-download";

const exportGraph = (domNodeId: string) => {
  const node = document.getElementById(domNodeId);
  if (!node) {
    return;
  }

  domtoimage.toBlob(node, { bgcolor: 'white' })
    .then((blob: Blob) => {
      fileDownload(blob, `${domNodeId}.png`);
    });
}

export const SaveAction = ({ targetRef }: { targetRef: string }) => {
  return (
    <IconButton aria-label="save" title="Save as image" onClick={() => exportGraph(targetRef)}>
      <SaveAltIcon />
    </IconButton>
  );
};
