export const moonrakerHttpHistoryResponse = {
  count: 2,
  jobs: [
    {
      job_id: "voron-000123",
      exists: true,
      filename: "printworks/customer-bracket_0.2mm_PLA_Voron2_3h14m.gcode",
      status: "completed",
      start_time: 1_767_260_400.25,
      end_time: 1_767_272_040.5,
      print_duration: 10_980.4,
      total_duration: 11_640.2,
      filament_used: 9123.45,
      metadata: {
        slicer: "OrcaSlicer",
        slicer_version: "2.3.1",
        filament_type: "PLA;PETG",
        filament_name: "Polymaker PLA Black;Generic PETG Clear",
        filament_colour: "#1f1f1f;#eeeeee",
        filament_total: 9123.45,
        filament_weight_total: 27.75,
        filament_weights: [20.25, 7.5],
        referenced_tools: [0, 1],
        thumbnails: [
          {
            width: 300,
            height: 300,
            size: 43128,
            relative_path: ".thumbs/customer-bracket-300x300.png",
          },
        ],
      },
      auxiliary_data: [
        {
          provider: "spoolman",
          name: "spool_ids",
          value: [12, 18],
          description: "Spool IDs used",
          units: null,
        },
      ],
    },
    {
      job_id: "voron-000124",
      exists: false,
      filename: "failed/prototype-case.gcode",
      status: "klippy_shutdown",
      start_time: 1_767_280_000,
      end_time: 1_767_281_200,
      print_duration: 900,
      total_duration: 1200,
      filament_used: 420.1,
      metadata: {
        filament_type: "ABS",
        filament_weight_total: "4.2 g",
      },
    },
  ],
};
