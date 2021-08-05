import moment from "moment"
import domtoimage from "dom-to-image";
import fileDownload from "js-file-download";

export const isBusinessHours = (incidentStartedAt: moment.Moment): boolean  => {
    return incidentStartedAt.hour() >= 9 && incidentStartedAt.hour() < 18;
};

export const exportGraph = (domNodeId: string) => {
    const node = document.getElementById(domNodeId);
    if (!node) {
        return;
    }

    domtoimage.toBlob(node, {bgcolor: 'white'})
        .then(function (blob: Blob) {
            fileDownload(blob, domNodeId+'.png');
        });
}
