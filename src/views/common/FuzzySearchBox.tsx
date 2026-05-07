import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
} from 'react';
import fuzzysort from 'fuzzysort';
import {
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
  Box,
  CircularProgress,
  Paper,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";
import nlp from "compromise";

export interface FuzzySearchItem {
  id: string | number;
  title: string;
  description?: string;
  path: string;
  [key: string]: any;
}

interface FuzzySearchBoxProps<T extends FuzzySearchItem> {
  placeholder?: string;
  fetchData: () => Promise<T[]>;
  preprocessItem?: (item: T) => T;
  fuzzysortOptions?: Fuzzysort.Options<T>;
  debounceDelay?: number;
  primaryResultKey?: string;
  secondaryResultKey?: string;
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

const FuzzySearchBox = <T extends FuzzySearchItem>({
                                                     placeholder = 'Search...',
                                                     fetchData,
                                                     preprocessItem,
                                                     fuzzysortOptions,
                                                     debounceDelay = 300,
                                                     primaryResultKey = 'title',
                                                     secondaryResultKey = 'description',
                                                   }: FuzzySearchBoxProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Fuzzysort.Result<T>[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const anchorEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData().then((raw) => {
      const processed = preprocessItem ? raw.map(preprocessItem) : raw;
      setItems(processed);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array

  const performSearch = useCallback(
    (term: string) => {
      if (!term.trim()) {
        setResults([]);
        setShowResults(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setShowResults(true);

      const options: Fuzzysort.Options<T> = fuzzysortOptions || {
        keys: ['title', 'description'],
        allowTypo: true,
        threshold: -5000,
        limit: 20,
      };
      const { finalTerm, minRating } = transformSearchTerm(term);
      const searchResults = fuzzysort.go<T>(finalTerm, items, options);

      const filtered = searchResults.filter((r) => {
        const scoreOk = r.score !== undefined && r.score > options.threshold!;
        const ratingOk =
          minRating !== undefined
            ? (r.obj as any).rating >= minRating
            : true;
        return scoreOk && ratingOk;
      });
      setResults(filtered);
      setLoading(false);
    },
    [items, fuzzysortOptions]
  );

  const debouncedSearch = useCallback(
    debounce(performSearch, debounceDelay),
    [performSearch]
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
    debouncedSearch(newTerm);
  };

  const handleItemClick = (item: T) => {
    navigate(item.path);
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };

  const handleCloseResults = () => {
    setTimeout(() => setShowResults(false), 100);
  };

  const handleFocus = () => {
    if (searchTerm.trim() && results.length > 0) {
      setShowResults(true);
    }
  };

  interface ParsedSearchIntent {
    finalTerm: string;
    minRating?: number;
  }

  const transformSearchTerm = (term: string): ParsedSearchIntent => {
    let finalTerm = term;
    let minRating: number | undefined = undefined;

    try {
      const doc = nlp(term.toLowerCase());
      const nouns = doc.nouns().toSingular().out('array');
      const verbs = doc.verbs().toInfinitive().out('array');
      const keyTerms = [...new Set([...nouns, ...verbs])];
      finalTerm = keyTerms.length > 0 ? keyTerms.join(' ') : term;

      const ratingMatch = term.match(/([1-5])\s*star/);
      if (ratingMatch) {
        minRating = parseInt(ratingMatch[1], 10);
      } else {
        const values = doc.values().toNumber().out('array');
        if (values?.[0] && values[0] >= 1 && values[0] <= 5 && doc.has('star')) {
          minRating = values[0];
        }
      }
    } catch (err) {
      console.warn('Error in NLP transform', err);
    }

    return { finalTerm, minRating };
  }

  function searchBoxStyle(theme: Theme) {
    return {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(0.5, 1.5),
      transition: theme.transitions.create(["border-color", "box-shadow"]),
      "&:hover": {
        borderColor: theme.palette.text.primary
      },
      "&.Mui-focused": {
        boxShadow: `${theme.palette.primary.main} 0 0 0 2px`,
        borderColor: theme.palette.primary.main
      }
    };
  }

  return (
    <ClickAwayListener onClickAway={handleCloseResults}>
      <Box sx={{ position: 'relative', minWidth: '12rem', maxWidth: '24rem', width: '100%' }}>
        <div ref={anchorEl}>
          <TextField
            fullWidth
            variant="standard"
            size="small"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            inputRef={inputRef}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start" sx={{ pl: 1, color: 'inherit' }}>
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SearchIcon fontSize="small" />
                  )}
                </InputAdornment>
              ),
              sx: (theme) => searchBoxStyle(theme),
            }}
            autoComplete="off"
          />
        </div>

        <Popper
          open={showResults && (loading || results.length > 0)}
          anchorEl={anchorEl.current}
          placement="bottom-start"
          modifiers={[
            { name: 'offset', options: { offset: [0, 8] } },
            { name: 'flip', enabled: false },
            { name: 'computeStyles', options: { adaptive: false } },
          ]}
          style={{
            zIndex: 1200,
            width: anchorEl.current?.clientWidth,
          }}
        >
          <Paper elevation={3} sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {!loading && results.length === 0 && searchTerm && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No results found.
              </Typography>
            )}

            {!loading && results.length > 0 && (
              <List dense sx={{ p: 0.5 }}>
                {results.map((r) => (
                  <ListItem key={r.obj.id} disablePadding>
                    <ListItemButton onClick={() => handleItemClick(r.obj)} sx={{ borderRadius: 1 }}>
                      <ListItemText primary={r.obj[primaryResultKey]} secondary={r.obj[secondaryResultKey]} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default FuzzySearchBox;
