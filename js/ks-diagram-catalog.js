window.__FORGE_KS_DIAGRAM_CATALOG = {
    linear: {
      title: 'Linear Flow',
      items: [
        { node: 'Step A', color: 'cyan',  desc: 'First stage in a sequential process. Replace [subtitle] with the specific activity.' },
        { node: 'Step B', color: 'cyan',  desc: 'Second stage. Each box represents a discrete phase with a clear handoff.' },
        { node: 'Step C', color: 'amber', desc: 'Third stage. Connectors show the direction of flow between steps.' },
        { node: 'Step D', color: 'amber', desc: 'Final stage. Use the footer note for caveats (e.g. "iterate as needed").' }
      ]
    },
    loop: {
      title: 'Loop / Cycle',
      items: [
        { node: 'Phase 1', color: 'cyan',  desc: 'First phase of the iterative cycle (e.g. Plan). The cycle restarts after the last phase.' },
        { node: 'Phase 2', color: 'cyan',  desc: 'Second phase (e.g. Execute). Connectors trace a circular path.' },
        { node: 'Phase 3', color: 'amber', desc: 'Third phase (e.g. Review). Feedback flows back into the next iteration.' },
        { node: 'Phase 4', color: 'amber', desc: 'Fourth phase (e.g. Adapt). The "repeat" label indicates continuous cycling.' }
      ]
    },
    gate: {
      title: 'Gate Chain',
      items: [
        { node: 'Stage 1', color: 'cyan',    desc: 'First activity block. Work happens here until the gate checkpoint.' },
        { node: 'Gate 1',  color: 'amber',   desc: 'First gate (diamond). Criteria must be met before proceeding to the next stage.' },
        { node: 'Stage 2', color: 'emerald', desc: 'Second activity block, entered only after passing the first gate.' },
        { node: 'Gate 2',  color: 'amber',   desc: 'Second gate checkpoint before the final stage.' },
        { node: 'Stage 3', color: 'amber',   desc: 'Final activity. The pill shape indicates successful completion.' }
      ]
    },
    swimlane: {
      title: 'Swimlane',
      items: [
        { node: 'Step A', color: 'cyan',    desc: 'Begins in Role A\'s lane. Horizontal lanes group steps by responsibility.' },
        { node: 'Step B', color: 'emerald', desc: 'Handed off to Role B. Cross-lane arrows show handoff points.' },
        { node: 'Step C', color: 'amber',   desc: 'Parallel work in Role C\'s lane. Multiple lanes can be active simultaneously.' },
        { node: 'Step D', color: 'cyan',    desc: 'Returns to Role A. Steps can move freely across lanes.' },
        { node: 'Step E', color: 'emerald', desc: 'Second step in Role B. The pattern continues until the process completes.' },
        { node: 'Step F', color: 'amber',   desc: 'Final step in Role C. Footer notes describe handoff policies.' }
      ]
    },
    decision: {
      title: 'Decision Flow',
      items: [
        { node: 'Start',      color: 'emerald', desc: 'Rounded terminal marking the process entry point.' },
        { node: 'Process A',  color: 'cyan',    desc: 'Action step (rectangle). Represents a concrete activity.' },
        { node: 'Condition?', color: 'amber',   desc: 'Decision diamond. The flow branches based on a yes/no condition.' },
        { node: 'Process B',  color: 'cyan',    desc: 'Yes-branch action. Taken when the condition is satisfied.' },
        { node: 'Process C',  color: 'emerald', desc: 'No-branch action. Taken when the condition fails.' },
        { node: 'End',        color: 'amber',   desc: 'Terminal node. Both branches converge here.' }
      ]
    },
    funnel: {
      title: 'Funnel',
      items: [
        { node: 'Stage 1', color: 'cyan',    desc: 'Widest top stage (100%). Everything enters here.' },
        { node: 'Stage 2', color: 'cyan',    desc: 'Narrower stage (65%). Volume decreases as items are filtered.' },
        { node: 'Stage 3', color: 'emerald', desc: 'Further narrowing (30%). Each stage has drop-off metrics.' },
        { node: 'Stage 4', color: 'amber',   desc: 'Narrowest stage (12%). The final conversion output.' }
      ]
    },
    tree: {
      title: 'Tree / Hierarchy',
      items: [
        { node: '[Root]',     color: 'cyan',  desc: 'Top-level root node. Everything branches from here.' },
        { node: '[Branch A]', color: 'cyan',  desc: 'First branch. Sub-branches and leaves nest below.' },
        { node: '[Branch B]', color: 'amber', desc: 'Second branch with a different accent color (purple).' },
        { node: '[Branch C]', color: 'amber', desc: 'Third branch. Single leaf child shown.' }
      ]
    },
    orgchart: {
      title: 'Org chart (people cards)',
      items: [
        { node: 'CEO card', color: 'cyan', desc: 'Executive card: avatar circle (photo or initials), full name, title, org/team line. Strong cyan border for top role.' },
        { node: 'VP Engineering', color: 'cyan', desc: 'Manager card with same chrome; connects to individual contributors. Replace placeholders with real names and titles.' },
        { node: 'VP Product', color: 'amber', desc: 'Peer manager card; amber accent can denote a different division or product line.' },
        { node: 'Engineer', color: 'cyan', desc: 'IC card: smaller avatar, role title, squad or ladder (e.g. Platform). Extend for peers in the same subtree.' },
        { node: 'Designer', color: 'amber', desc: 'IC card under product leadership; use for design, PM, or other disciplines with the same slot pattern.' },
        { node: 'Reporting lines', color: 'emerald', desc: 'Solid connectors show direct reporting. Use dashed lines in content for dotted-line or matrix relationships (not shown in the template).' }
      ]
    },
    board: {
      title: 'Board / Columns',
      items: [
        { node: 'Column A', color: 'cyan',    desc: 'First column (e.g. Backlog). Cards pile up inside each column.' },
        { node: 'Column B', color: 'emerald', desc: 'Second column. Items flow left to right across columns.' },
        { node: 'Column C', color: 'amber',   desc: 'Third column with dashed border indicating a constraint (e.g. WIP limit).' },
        { node: 'Column D', color: 'amber',   desc: 'Final column (e.g. Done). Purple accent marks the endpoint.' }
      ]
    },
    checklist: {
      title: 'Checklist',
      items: [
        { node: '[Criterion A', color: 'cyan', desc: 'First criterion with check mark. All items must hold for acceptance.' },
        { node: '[Criterion B', color: 'cyan', desc: 'Second criterion. Consistent styling for each row.' },
        { node: '[Criterion C', color: 'cyan', desc: 'Third criterion. Extend the list as needed.' },
        { node: '[Criterion D', color: 'cyan', desc: 'Fourth criterion. Use for DoD, acceptance criteria, or audit checklists.' },
        { node: '[Criterion E', color: 'cyan', desc: 'Fifth criterion. Footer note explains pass/fail rules.' }
      ]
    },
    network: {
      title: 'Network / Topology',
      items: [
        { node: 'Hub',    color: 'cyan',    desc: 'Central hub node with connections radiating to all peers.' },
        { node: 'Node A', color: 'cyan',    desc: 'Peer node. Edges show direct connections between nodes.' },
        { node: 'Node B', color: 'emerald', desc: 'Another peer. Different stroke colors distinguish node types.' },
        { node: 'Node C', color: 'amber',   desc: 'Inner node with purple accent. Connected to multiple neighbors.' },
        { node: 'Node D', color: 'amber',   desc: 'Leaf-level node. Amber accent for emphasis.' },
        { node: 'Node E', color: 'amber',   desc: 'Edge node connected to its neighbor. Footer describes connection semantics.' }
      ]
    },
    venn: {
      title: 'Venn Diagram',
      items: [
        { node: 'Set A', color: 'cyan',  desc: 'First circle. Overlaps with Set B at the top and Set C at the left.' },
        { node: 'Set B', color: 'cyan',  desc: 'Second circle. Overlaps with Set A at the top and Set C at the right.' },
        { node: 'Set C', color: 'amber', desc: 'Third circle. Overlaps with both A and B. Triple intersection highlighted in amber.' }
      ]
    },
    gantt: {
      title: 'Gantt Chart',
      items: [
        { node: 'Task A', color: 'cyan',    desc: 'First task bar spanning weeks 1-2. Horizontal position shows timing.' },
        { node: 'Task B', color: 'cyan',    desc: 'Second task starting in week 2. Dependency arrow links from Task A.' },
        { node: 'Task C', color: 'emerald', desc: 'Third task spanning weeks 3-4. Bars can overlap across rows.' },
        { node: 'Task D', color: 'amber',   desc: 'Fourth task in the later phase. The milestone diamond marks a checkpoint.' },
        { node: 'Task E', color: 'amber',   desc: 'Final task. Color variations indicate different work streams.' }
      ]
    },
    timeline: {
      title: 'Timeline',
      items: [
        { node: 'Event A', color: 'cyan',  desc: 'First milestone on the axis. Labels alternate above and below for readability.' },
        { node: 'Event B', color: 'cyan',  desc: 'Second event. Date labels sit opposite the event description.' },
        { node: 'Event C', color: 'cyan',  desc: 'Mid-timeline event. Circles mark the exact point on the axis.' },
        { node: 'Event D', color: 'amber', desc: 'Later event with amber accent. Highlights a notable milestone.' },
        { node: 'Event E', color: 'amber', desc: 'Final event. Purple accent for the terminus.' }
      ]
    },
    roadmap: {
      title: 'Roadmap',
      items: [
        { node: 'Feature 1', color: 'cyan',    desc: 'First feature bar in Track A. Horizontal span shows duration across quarters.' },
        { node: 'Feature 2', color: 'cyan',    desc: 'Second feature in Track A, later in the timeline.' },
        { node: 'Feature 3', color: 'emerald', desc: 'Long-running feature in Track B spanning multiple quarters.' },
        { node: 'Feature 4', color: 'amber',   desc: 'Short feature in Track C. Multiple bars per track show parallel efforts.' },
        { node: 'Feature 5', color: 'amber',   desc: 'Another short feature in Track C.' },
        { node: 'Feature 6', color: 'amber',   desc: 'Final feature with purple accent. Milestone diamond marks a key date.' }
      ]
    },
    bar: {
      title: 'Bar Chart',
      items: [
        { node: 'Cat A', color: 'cyan',    desc: 'First category bar (85). Bar height maps to the Y-axis value.' },
        { node: 'Cat B', color: 'cyan',    desc: 'Second category (60). Values above each bar for quick reading.' },
        { node: 'Cat C', color: 'emerald', desc: 'Tallest bar (92). Color distinguishes different categories.' },
        { node: 'Cat D', color: 'amber',   desc: 'Shortest bar (45). The Y-axis grid provides scale reference.' },
        { node: 'Cat E', color: 'amber',   desc: 'Fifth bar (72). Footer note describes the unit of measure.' }
      ]
    },
    line: {
      title: 'Line Chart',
      items: [
        { node: 'Series A', color: 'cyan',  desc: 'Primary trend line (solid cyan). Data points are marked with dots.' },
        { node: 'Series B', color: 'amber', desc: 'Secondary series (dashed amber). Dash style differentiates multiple lines.' }
      ]
    },
    pie: {
      title: 'Pie / Donut',
      items: [
        { node: 'Slice A', color: 'cyan',    desc: 'Largest segment (35%). Donut ring technique with center label.' },
        { node: 'Slice B', color: 'cyan',    desc: 'Second segment (25%). Legend below maps colors to labels.' },
        { node: 'Slice C', color: 'emerald', desc: 'Third segment (22%). Consistent color coding across the palette.' },
        { node: 'Slice D', color: 'amber',   desc: 'Smallest segment (18%). Percentages sum to 100%.' }
      ]
    },
    radar: {
      title: 'Radar / spider',
      items: [
        { node: 'Series A (current)', color: 'cyan',  desc: 'Filled polygon (solid stroke) — one profile across axes (e.g. current state).' },
        { node: 'Series B (target)', color: 'amber', desc: 'Second polygon (dashed) — compare targets, benchmarks, or peers.' },
        { node: '[A]–[F]', color: 'emerald', desc: 'Axis labels around the grid; replace with criteria or dimensions.' }
      ]
    },
    'nested-donut': {
      title: 'Nested donut',
      items: [
        { node: 'Outer W', color: 'cyan',    desc: 'Outer ring segment — first level of the breakdown (e.g. region).' },
        { node: 'Outer X', color: 'cyan',    desc: 'Adjacent outer segment; legend maps ring color to category.' },
        { node: 'Outer Y', color: 'emerald', desc: 'Third outer segment; proportions sum to the outer ring.' },
        { node: 'Outer Z', color: 'amber',   desc: 'Fourth outer segment; often the smallest share.' },
        { node: 'Inner P', color: 'cyan',    desc: 'Inner ring — second-level split (e.g. product within region).' },
        { node: 'Inner Q', color: 'cyan',    desc: 'Second inner segment.' },
        { node: 'Inner R', color: 'amber',   desc: 'Third inner segment; center label shows total or headline %.' }
      ]
    },
    stacked: {
      title: 'Stacked Bar',
      items: [
        { node: 'Group A', color: 'cyan',    desc: 'First stacked bar. Each bar is subdivided into colored layers.' },
        { node: 'Group B', color: 'cyan',    desc: 'Second bar. Layer proportions vary to show composition differences.' },
        { node: 'Group C', color: 'emerald', desc: 'Third bar. Legend maps each layer color to its meaning.' },
        { node: 'Group D', color: 'amber',   desc: 'Fourth bar. Total height shows the aggregate value.' }
      ]
    },
    area: {
      title: 'Area Chart',
      items: [
        { node: 'Area A', color: 'cyan',  desc: 'Primary area (cyan fill). Filled region shows cumulative volume.' },
        { node: 'Area B', color: 'amber', desc: 'Secondary area (amber fill, dashed). Overlapping areas show two series.' }
      ]
    },
    scatter: {
      title: 'Scatter Plot',
      items: [
        { node: 'Group A', color: 'cyan',  desc: 'Cyan dots showing one group. Dot size can encode a third dimension.' },
        { node: 'Group B', color: 'amber', desc: 'Amber dots for a second group. Position on X/Y axes shows correlation.' }
      ]
    },
    waterfall: {
      title: 'Waterfall / bridge',
      items: [
        { node: 'Start', color: 'cyan',    desc: 'Baseline column (e.g. opening balance). Height anchors the bridge.' },
        { node: 'Chg Revenue', color: 'emerald', desc: 'Positive floating bar — increases the running total.' },
        { node: 'Chg Cost', color: 'amber',   desc: 'Negative floating bar — decreases the running total.' },
        { node: 'Chg Risk', color: 'emerald', desc: 'Another step; connector lines show where each bar lands.' },
        { node: 'Total', color: 'cyan',    desc: 'End column — sum or closing position after all steps.' }
      ]
    },
    sequence: {
      title: 'Sequence diagram',
      items: [
        { node: 'Client', color: 'cyan', desc: 'Calling actor at the left lifeline. Replace with your UI, gateway, or user system.' },
        { node: 'Service', color: 'cyan', desc: 'Middle tier handling orchestration and business rules.' },
        { node: 'Store', color: 'amber', desc: 'Downstream dependency (database, queue, or external API).' },
        { node: 'Call one', color: 'cyan', desc: 'First synchronous or async message from Client to Service.' },
        { node: 'Call two', color: 'amber', desc: 'Nested call from Service to Store.' },
        { node: 'Return data', color: 'emerald', desc: 'Response from Store back to Service.' },
        { node: 'Final reply', color: 'cyan', desc: 'Consolidated response to the original caller.' }
      ]
    },
    state: {
      title: 'State machine',
      items: [
        { node: 'Idle', color: 'cyan', desc: 'Initial / waiting state before work starts.' },
        { node: 'Active', color: 'cyan', desc: 'Work in progress; substates can nest in content instances.' },
        { node: 'Succeeded', color: 'emerald', desc: 'Terminal success state (rounded pill).' },
        { node: 'Failed', color: 'amber', desc: 'Error or rejection path; often loops back via Retry to Idle or Active.' }
      ]
    },
    quadrant: {
      title: 'Quadrant Matrix',
      items: [
        { node: 'Quadrant A', color: 'cyan',    desc: 'Top-left quadrant. Label and description customize each zone.' },
        { node: 'Quadrant B', color: 'cyan',    desc: 'Top-right quadrant. Dots represent data points positioned by two criteria.' },
        { node: 'Quadrant C', color: 'amber',   desc: 'Bottom-left quadrant. Axis labels define the evaluation dimensions.' },
        { node: 'Quadrant D', color: 'emerald', desc: 'Bottom-right quadrant. Footer describes the decision framework.' }
      ]
    },
    gauge: {
      title: 'Gauge / Meter',
      items: [
        { node: '75%',    color: 'cyan',  desc: 'Current value displayed prominently. Needle position maps to the arc.' },
        { node: 'Target', color: 'amber', desc: 'Dashed target line for comparison. Red/amber/green zones show health bands.' }
      ]
    },
    kpi: {
      title: 'KPI Card',
      items: [
        { node: '1,234', color: 'cyan',    desc: 'Big number — the primary metric. Designed for dashboard tiles.' },
        { node: '+12%',  color: 'emerald', desc: 'Trend indicator with direction arrow. Green = positive, red = negative.' }
      ]
    },
    bullet: {
      title: 'Bullet chart',
      items: [
        { node: 'Range bands', color: 'cyan',    desc: 'Background zones (poor / fair / good) — qualitative thresholds along the scale.' },
        { node: 'Comparative', color: 'emerald', desc: 'Thin bar (e.g. prior period) behind the actual for quick comparison.' },
        { node: 'Actual', color: 'cyan',        desc: 'Thick bar — current performance against the scale.' },
        { node: 'Target', color: 'amber',       desc: 'Vertical marker — goal or commitment to hit.' }
      ]
    },
    heatmap: {
      title: 'Heatmap',
      items: [
        { node: 'Row 1', color: 'cyan',  desc: 'First data row — five cells across columns A–E. Intensity (opacity) maps to the value.' },
        { node: 'Row 2', color: 'cyan',  desc: 'Second row. Compare cells left-to-right within the row.' },
        { node: 'Row 3', color: 'cyan',  desc: 'Third row. Brighter cells indicate higher scores in this template.' },
        { node: 'Row 4', color: 'amber', desc: 'Fourth row. The gradient legend below shows the intensity scale.' }
      ]
    }
  };
