export default ({photos, margin, targetWidth, targetRowHeight, portraitRatioLimit, landscapeRatioLimit}) => {
	let acc = 0;
	let row = [];
	const rows = [];

	for (const photo of photos) {
		if (acc !== 0) {
			acc += margin;
		}

		let renderWidth = photo.width;
		if (photo.width === photo.height) {
			renderWidth = targetRowHeight;
		} else if (photo.width < photo.height) {
			if (photo.width * portraitRatioLimit < photo.height) {
				renderWidth = targetRowHeight / portraitRatioLimit;
			} else {
				renderWidth = targetRowHeight / photo.height * photo.width;
			}
		} else {
			if (photo.height * landscapeRatioLimit < photo.width) {
				renderWidth = targetRowHeight * landscapeRatioLimit;
			} else {
				renderWidth = targetRowHeight / photo.height * photo.width;
			}
		}

		acc += renderWidth;
		row.push({...photo, renderWidth, renderHeight: targetRowHeight});
		if (acc >= targetWidth) {
			const zoom = targetWidth / acc;
			for (const rowItem of row) {
				rowItem.renderWidth *= zoom;
				rowItem.renderHeight *= zoom;
			}

			rows.push(row);
			row = [];
			acc = 0;
		}
	}

	if (row.length > 0) {
		rows.push(row);
	}

	return rows;
};
