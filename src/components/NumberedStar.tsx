import StarIcon from '@mui/icons-material/Star';

export const StarRating = ({ rating }) => {

    const parsedRating = Number(rating);
    if (isNaN(parsedRating)) return null;
    const pubRating = Math.min(Math.round(parsedRating), 5);

    return (
        <span
            key={pubRating}
            style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <StarIcon sx={{ fontSize: 30, color: '#faaf00' }} />
            <span
                style={{
                    marginTop: '0.64rem',
                    marginBottom: '0.50rem',
                    position: 'absolute',
                    color: 'white',
                    fontSize: '0.70rem',
                    fontWeight: 'bold',
                }}
            >
                {pubRating}
            </span>
        </span>
    );
};
