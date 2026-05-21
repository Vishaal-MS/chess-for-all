import { useState } from 'react';
import { Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { useNotify } from 'react-admin';
import { ListTitle } from '../../components/Title.tsx';
import { remoteLog } from '@mahaswami/vc-frontend';
import { clearVoiceOverCache } from '../../backend/voiceOver.ts';

export const ClearVoiceoverCache = () => {
    const [textList, setTextList] = useState('');
    const [invalidTexts, setInvalidTexts] = useState<string[]>([]);
    const [isClearingCache, setIsClearingCache] = useState(false);
    const notify = useNotify();

    const handleClearCache = async () => {
        try {
            const texts = textList.split('\n').map(text => text.trim()).filter(text => text.length > 0);
            setIsClearingCache(true)
            const result = await clearVoiceOverCache(texts);
            if (result?.invalidTexts && result?.invalidTexts.length > 0) {
                setInvalidTexts(result.invalidTexts);
                notify('Some voiceovers were not found in the cache.', { type: 'warning' });
            } else {
                setTextList("");
                setInvalidTexts([]);
                notify('Voiceover cache cleared successfully!', { type: 'success' });
            }
        } catch (error) {
            console.error('Error clearing voiceover cache:', error);
            remoteLog('Error clearing voiceover cache:', error);
            notify('Failed to clear voiceover cache.', { type: 'error' });
        } finally {
            setIsClearingCache(false);
        }
    };

    return (
        <Card sx={{ mt: 2, borderRadius: 2 }}>
            <CardContent>
                <ListTitle resourceName="Clear Voiceover Cache" />
                <Typography variant="body1" paragraph>
                    Enter a list of texts (one per line) for which you want to clear the voiceover cache.
                </Typography>
                <TextField
                    label="Texts to Clear Cache"
                    multiline
                    rows={10}
                    fullWidth                    
                    value={textList}
                    onChange={(e) => setTextList(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                {invalidTexts.length > 0 && (
                    <Typography variant="body2" color="error">
                        The following texts were not found in the cache:
                        <ul>
                            {invalidTexts.map((text, index) => (
                                <li key={index}>{text}</li>
                            ))}
                        </ul>
                    </Typography>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClearCache}
                    loading={isClearingCache}
                    disabled={isClearingCache}
                    sx={{ mt: 2 }}
                >
                    Clear Cache
                </Button>
            </CardContent>
        </Card>
    );
};