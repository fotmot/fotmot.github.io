class PreviousSourceImpl extends Source{
    show(src) {
        if (src.type == 'video') {
            playVideo(src.src, src.html);
        } else {
            showImage(src.src, src.html);
        }
    }
}