const tree = Phylocanvas.createTree('id', {
    metadata: {
        active: true,
        showHeaders: true,
        showLabels: true,
        blockLength: 32,
        blockSize: null,
        padding: 8,
        columns: [],
        propertyName: 'data',
        underlineHeaders: true,
        headerAngle: 90,
        fillStyle: 'black',
        strokeStyle: 'black',
        lineWidth: 1,
        font: null,
    }
})

tree.on('loaded', function() {
    // add metadata to leaves
    for (const leaf of tree.leaves) {
        leaf.data = {
            columnA: 'value',
            columnB: true,
            columnC: 10,
        };
    }
    tree.viewMetadataColumns();
    tree.draw();
});