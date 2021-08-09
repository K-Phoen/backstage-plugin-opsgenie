import moment from "moment"
import domtoimage from "dom-to-image";
import fileDownload from "js-file-download";
import { Incident } from "../../types";

export const isBusinessHours = (incidentStartedAt: moment.Moment): boolean => {
    return incidentStartedAt.hour() >= 9 && incidentStartedAt.hour() < 18;
};

export const respondingTeam = (incident: Incident): string => {
    if (incident.extraProperties['responders']) {
        return incident.extraProperties['responders'];
    }

    const teamResponders = incident.responders.filter((responderRef) => responderRef.type === "team");

    if (teamResponders.length === 0) {
        return "Unknown";
    }

    return teamResponders[0].id;
};

export const exportGraph = (domNodeId: string) => {
    const node = document.getElementById(domNodeId);
    if (!node) {
        return;
    }

    domtoimage.toBlob(node, { bgcolor: 'white' })
        .then(function (blob: Blob) {
            fileDownload(blob, domNodeId + '.png');
        });
}

export const stringToColour = (str: string) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}
